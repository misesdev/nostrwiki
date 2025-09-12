**API em .NET Core**, **indexadores em Node.js**, **Postgres**, **Redis** e **Next.js** :

---

```mermaid

    %% Users
    User[User / Browser] -->|Search Query| NextJS[Next.js Frontend]

    %% Frontend to API
    NextJS -->|API Request| API[.NET Core API (Search Only)]

    %% API to Cache/DB
    API -->|Check cache| Redis[(Redis Cache)]
    API -->|Full-text Search / Queries| Postgres[(PostgreSQL Database)]

    %% Indexers
    subgraph Indexers [Node.js Indexer Services]
        Walker[Pubkey Walker Service] -->|Insert pubkeys / +ref_count| Postgres
        UserIndexer[User Indexer Service] -->|Fetch profiles (kind 0)| Postgres
        NoteIndexer[Note Indexer Service] -->|Fetch posts (kind 1) + media refs| Postgres
        MediaIndexer[Media Indexer Service] -->|Extract files (img/video/audio)| Postgres
    end

    %% Maintenance / Coordination
    Postgres --> Redis
    Redis --> Walker
    Redis --> UserIndexer
    Redis --> NoteIndexer
    Redis --> MediaIndexer

    %% Future expansion
    Postgres --> Elastic[(ElasticSearch - future)]

    %% User Response
    API -->|Search Results| NextJS
    NextJS --> User
```

---

### 🔹 How to read this diagram

* **Users** interact only with the **Next.js frontend**, which queries the **.NET Core API**.
* The **API** first checks Redis (cache), then queries Postgres if needed.
* **Node.js Indexers** continuously crawl Nostr events and feed the Postgres DB.
* **Redis** can be used both as a **cache** (for API) and as a **queue/coordination layer** (for indexers).
* In the **future**, Postgres can feed **ElasticSearch** for more advanced search.

