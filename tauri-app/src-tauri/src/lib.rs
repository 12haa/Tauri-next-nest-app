use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;
use sqlx::{sqlite::SqlitePoolOptions, FromRow};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
struct User {
    id: i64,
    name: String,
    email: String,
    password: String,
    age: Option<i64>,
    phone: Option<String>,
    profile_picture: Option<String>,
    bio: Option<String>,
    address: Option<String>,
    role: Option<String>,
    date_of_birth: Option<String>,
    date_of_death: Option<String>,
    last_login_at: Option<String>,
    created_at: Option<String>,
    updated_at: Option<String>,
    updated_from: Option<String>,
}

#[tauri::command]
async fn get_users(app_handle: tauri::AppHandle) -> Result<Vec<User>, String> {
    let db_url = get_db_url(&app_handle)?;
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let users = sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Failed to query users: {}", e))?;

    Ok(users)
}

#[tauri::command]
async fn add_user(
    app_handle: tauri::AppHandle,
    name: String,
    email: String,
    password: String,
) -> Result<(), String> {
    let db_url = get_db_url(&app_handle)?;
    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(name)
    .bind(email)
    .bind(password)
    .bind(now.clone())
    .bind(now)
    .execute(&pool)
    .await
    .map_err(|e| format!("Failed to add user: {}", e))?;

    Ok(())
}

fn get_db_url(app_handle: &tauri::AppHandle) -> Result<String, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;

    let db_path = app_data_dir.join("app.db");
    Ok(format!("sqlite:{}", db_path.to_string_lossy()))
}

/// Run the Tauri app
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![greet, get_users, add_user])
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = update_check(handle).await {
                    eprintln!("Failed to check for updates: {}", e);
                }
            });

            // Run migrations on startup
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let db_url = get_db_url(&handle).unwrap();
                let pool = SqlitePoolOptions::new()
                    .connect(&db_url)
                    .await
                    .expect("Failed to connect to DB");

                sqlx::query(
                    r#"
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL UNIQUE,
                        password TEXT NOT NULL,
                        age INTEGER,
                        phone TEXT,
                        profile_picture TEXT,
                        bio TEXT,
                        address TEXT,
                        role TEXT,
                        date_of_birth TEXT,
                        date_of_death TEXT,
                        last_login_at TEXT,
                        created_at TEXT,
                        updated_at TEXT,
                        updated_from TEXT
                    )
                    "#,
                )
                .execute(&pool)
                .await
                .expect("Failed to run migration");
                 println!("Database initialized successfully");
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn update_check(app: tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    use tauri_plugin_updater::UpdaterExt;

    if let Some(update) = app.updater()?.check().await? {
        println!("Update available: {}", update.version);
        if confirm_update(&app, &update.version).await {
            match update
                .download_and_install(
                    |chunk, total| {
                        if let Some(total) = total {
                            println!("Downloaded {}/{}", chunk, total);
                        } else {
                            println!("Downloaded {} bytes", chunk);
                        }
                    },
                    || println!("Download finished, installing update..."),
                )
                .await
            {
                Ok(_) => {
                    println!("Update installed, restarting app...");
                    app.restart();
                }
                Err(e) => eprintln!("Failed to install update: {}", e),
            }
        }
    }

    Ok(())
}

async fn confirm_update(_app: &tauri::AppHandle, version: &str) -> bool {
    println!("Update available: {} - automatically updating", version);
    true
}
