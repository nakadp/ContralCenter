use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::IntoResponse,
    routing::get,
    Router,
};
use std::net::SocketAddr;
use tauri::{AppHandle, Emitter};

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

    while let Some(msg) = socket.recv().await {
        if let Ok(msg) = msg {
            match msg {
                Message::Text(text) => {
                    println!("Received from iPad: {}", text);
                    // Emit to frontend
                    if let Err(e) = app.emit("ipad-command", &text) {
                        eprintln!("Failed to emit ipad-command: {}", e);
                    }
                }
                _ => {}
            }
        } else {
            break;
        }
    }

    println!("iPad Disconnected");
}
