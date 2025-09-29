# NostrWiki

This project was created to provide **search functionality for the Nostr protocol**.  
It implements a simplified **PageRank-like algorithm** to index users, notes, files, and user profiles.  

The indexing process works by randomly navigating through users and notes, collecting data such as:  
- the number of references and followers a user has  
- the number of notes referencing other notes  

This approach is similar to Google’s PageRank, but adapted in a simpler form for Nostr.  

---

## 🌍 Access

You can try the project online at:  
👉 [https://nostrwiki.org](https://nostrwiki.org)

---

## 🔌 Public API

The project provides a **public API** that allows client applications on the Nostr protocol to integrate search features directly.

---

## 🚀 Features
- Simplified PageRank-based indexing  
- Indexing of users, notes, files, and profiles  
- Random walk crawling through the Nostr network  
- Public API available for developers  

---

## How to Run?

### 1 - Clone the project
```bash
    git clone https://github.com/misesdev/nostrwiki.git
    cd nostrwiki
```

### 2 - Configure your .env file in ./ ./api 
```bash
    cp .env.example .env && cp ./api/.env.example ./api/.env
```

### 3 - Run with docker compose
```bash
    docker compose up --build -d
```
#### 3.1 - Run the migrations
```bash
    docker compose exec api bash
```
```bash
    php artisan migrate --seed
```

## 📖 License
This project is open-source and available under the MIT License.

