use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::IntoResponse,
    routing::get,
    Router,
};
use lazy_static::lazy_static;
use std::net::SocketAddr;
use tauri::{AppHandle, Emitter};
use tokio::sync::broadcast;

// Global broadcast channel for sending messages to iPad
lazy_static! {
    static ref BROADCAST: (broadcast::Sender<String>, broadcast::Receiver<String>) =
        broadcast::channel(100);
}

pub fn start_server(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        // build our application with a route
        let app_router = Router::new().route("/ws", get(ws_handler)).with_state(app);

        let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
        println!("iPad Bridge listening on {}", addr);

        match tokio::net::TcpListener::bind(addr).await {
            Ok(listener) => {
                if let Err(e) = axum::serve(listener, app_router).await {
                    eprintln!("Bridge Server Error: {}", e);
                }
            }
            Err(e) => eprintln!("Failed to bind port 8080: {}", e),
        }
    });
}

#[tauri::command]
pub fn send_to_ipad(payload: String) {
    // Send to all connected websockets
    let _ = BROADCAST.0.send(payload);
}

async fn ws_handler(ws: WebSocketUpgrade, State(app): State<AppHandle>) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, app))
}

async fn handle_socket(mut socket: WebSocket, app: AppHandle) {
    println!("iPad Connected!");

    // Send a welcome message
    if socket
        .send(Message::Text("Connected to Aether Core".to_string()))
        .await
        .is_err()
    {
        return;
    }

    // Subscribe to broadcast
    let mut rx = BROADCAST.0.subscribe();

    loop {
        tokio::select! {
            // Receive from iPad
            msg = socket.recv() => {
                match msg {
                     Some(Ok(Message::Text(text))) => {
                        println!("Received from iPad: {}", text);
                        if let Err(e) = app.emit("ipad-command", &text) {
                            eprintln!("Failed to emit ipad-command: {}", e);
                        }
                    }
                    Some(Ok(Message::Close(_))) | None => break,
                    _ => {}
                }
            }
            // Send to iPad (Broadcast)
            Ok(msg) = rx.recv() => {
                if socket.send(Message::Text(msg)).await.is_err() {
                    break;
                }
            }
        }
    }

    println!("iPad Disconnected");
}
