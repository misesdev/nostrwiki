<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AppSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('app_settings')->insertOrIgnore([
            // First public key from where indexing will start pubkey -> follows -> pubkeys..
            "initial_pubkey" => "55472e9c01f37a35f6032b9b78dade386e6e4c57d80fd1d0646abb39280e5e27",
            // Current pubkey index that will increment with each execution of pubkeys_per_process
            "pubkey_index" => 0,
            "user_pubkey_index" => 0,
            "note_pubkey_index" => 0,
            "file_pubkey_index" => 0,
            "relay_pubkey_index" => 0,
            // Number of pubkeys to be traversed per execution
            "pubkeys_per_process" => 25000,
            // Maximum number of events to be listed when indexing relays
            "max_fetch_notes" => 1000,
            // Number of pubkeys for each note query
            "pubkeys_per_notes" => 25,
            // Current relay index that will increment with each execution of relays_connections
            "relay_index" => 0,
            "pubkey_relay_index" => 0,
            "user_relay_index" => 0,
            "note_relay_index" => 0,
            "file_relay_index" => 0,
            // Maximum number of connections with relays
            "relays_connections" => 80,
            // Maximum number of events per request when indexing relays
            "max_fetch_events" => 320,
            // Check if relays are reachable in batches of 20 relays (20 requests)
            "relays_betch_size" => 85,
            // Run every 1 minute
            "indexer_interval" => 5,

            "note_since" => null,
            "file_since" => null,
        ]);
    }
}
