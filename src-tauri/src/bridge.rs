use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::IntoResponse,
    routing::get,
    Router,
};
use std::net::SocketAddr;
use tauri::{AppHandle, Emitter};
use tokio::sync::broadcast;
use futures::{sink::SinkExt, stream::StreamExt};

pub fn start_server(app: AppHandle) {
    tokio::spawn(async move {
        // build our application with a route
        let app_router = Router::new()
            .route("/ws", get(ws_handler));

        let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
        println!("iPad Bridge listening on {}", addr);
        
        match tokio::net::TcpListener::bind(addr).await {
            Ok(listener) => {
                 if let Err(e) = axum::serve(listener, app_router).await {
                     eprintln!("Bridge Server Error: {}", e);
                 }
            },
            Err(e) => eprintln!("Failed to bind port 8080: {}", e),
        }
    });
}

async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    println!("iPad Connected!");
    
    // Send a welcome message
    if socket.send(Message::Text("Connected to Aether Core".to_string())).await.is_err() {
        return;
    }

    while let Some(msg) = socket.recv().await {
        if let Ok(msg) = msg {
            match msg {
                Message::Text(text) => {
                    println!("Received from iPad: {}", text);
                    // Broadcast or handle command
                    // logic to trigger tauri actions could go here (requires passing AppHandle down or using event bus)
                },
                _ => {}
            }
        } else {
             break;
        }
    }
    
    println!("iPad Disconnected");
}
