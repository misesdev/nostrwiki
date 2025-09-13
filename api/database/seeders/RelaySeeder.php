<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RelaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('relays')->insert([
            [ 'url' => 'wss://relay.damus.io', 'name' => 'wss://relay.damus.io', 'available' => true ],
            [ 'url' => 'wss://relay.nostr.bg', 'name' => 'wss://relay.nostr.bg', 'available' => true ],
            [ 'url' => 'wss://nostr.oxtr.dev', 'name' => 'wss://nostr.oxtr.dev', 'available' => true ],
            [ 'url' => 'wss://nostr.mom', 'name' => 'wss://nostr.mom', 'available' => true ],
            [ 'url' => 'wss://nos.lol', 'name' => 'wss://nos.lol', 'available' => true ],
            [ 'url' => 'wss://relay.snort.social', 'name' => 'wss://relay.snort.social', 'available' => true ],
            [ 'url' => 'wss://relay.nostr.com.au', 'name' => 'wss://relay.nostr.com.au', 'available' => true ],
            [ 'url' => 'wss://puravida.nostr.land', 'name' => 'wss://puravida.nostr.land', 'available' => true ],
            [ 'url' => 'wss://nostr.wine', 'name' => 'wss://nostr.wine', 'available' => true ],
            [ 'url' => 'wss://nostr.inosta.cc', 'name' => 'wss://nostr.inosta.cc', 'available' => true ],
            [ 'url' => 'wss://atlas.nostr.land', 'name' => 'wss://atlas.nostr.land', 'available' => true ],
            [ 'url' => 'wss://relay.nostr.band', 'name' => 'wss://relay.nostr.band', 'available' => true ],
            [ 'url' => 'wss://filter.nostr.wine', 'name' => 'wss://filter.nostr.wine', 'available' => true ],
            [ 'url' => 'wss://relay.noswhere.com', 'name' => 'wss://relay.noswhere.com', 'available' => true ],
            [ 'url' => 'wss://atlas.nostr.land', 'name' => 'wss://atlas.nostr.land', 'available' => true ],
            [ 'url' => 'wss://relay.nostr.net', 'name' => 'wss://relay.nostr.net', 'available' => true ],
            [ 'url' => 'wss://relay.primal.net', 'name' => 'wss://relay.primal.net', 'available' => true ],
            [ 'url' => 'wss://creatr.nostr.wine', 'name' => 'wss://creatr.nostr.wine', 'available' => true ],
            [ 'url' => 'wss://nostr.milou.lol', 'name' => 'wss://nostr.milou.lol', 'available' => true ],
            [ 'url' => 'wss://relay.nostr.pt', 'name' => 'wss://relay.nostr.pt', 'available' => true ],
            [ 'url' => 'wss://nostr.zebedee.cloud', 'name' => 'wss://nostr.zebedee.cloud', 'available' => true ],
            [ 'url' => 'wss://nostr.land', 'name' => 'wss://nostr.land', 'available' => true ],
            [ 'url' => 'wss://snort.social', 'name' => 'wss://snort.social', 'available' => true ],
            [ 'url' => 'wss://relayable.org', 'name' => 'wss://relayable.org', 'available' => true ],
            [ 'url' => 'wss://nostria.space', 'name' => 'wss://nostria.space', 'available' => true ],
            [ 'url' => 'wss://coracle.social', 'name' => 'wss://coracle.social', 'available' => true ],
            [ 'url' => 'wss://astral.ninja', 'name' => 'wss://astral.ninja', 'available' => true ],
            [ 'url' => 'wss://bitcoin.social', 'name' => 'wss://bitcoin.social', 'available' => true ],
            [ 'url' => 'wss://relay.poster.place', 'name' => 'wss://relay.poster.place', 'available' => true ],
            [ 'url' => 'wss://cobrafuma.com/relay', 'name' => 'wss://cobrafuma.com/relay', 'available' => true ],
            [ 'url' => 'wss://nostrua.com', 'name' => 'wss://nostrua.com', 'available' => true ],
            [ 'url' => 'wss://nostr.cercatrova.me', 'name' => 'wss://nostr.cercatrova.m', 'available' => true ],
            [ 'url' => 'wss://relay.hodl.ar', 'name' => 'wss://relay.hodl.ar', 'available' => true ],
            [ 'url' => 'wss://nostrgram.co', 'name' => 'wss://nostrgram.co', 'available' => true ],
            [ 'url' => 'wss://e.nos.lol', 'name' => 'wss://e.nos.lol', 'available' => true ],
            [ 'url' => 'wss://nostrelites.org', 'name' => 'wss://nostrelites.org', 'available' => true ],
            [ 'url' => 'wss://relay.0xchat.com', 'name' => 'wss://relay.0xchat.com', 'available' => true ],
            [ 'url' => 'wss://relay.nosflare.com', 'name' => 'wss://relay.nosflare.com', 'available' => true ],
            [ 'url' => 'wss://wot.utxo.one', 'name' => 'wss://wot.utxo.one', 'available' => true ],
            [ 'url' => 'wss://nostr.party', 'name' => 'wss://nostr.party', 'available' => true ],
            [ 'url' => 'wss://relay.lnau.net', 'name' => 'wss://relay.lnau.net', 'available' => true ],
            [ 'url' => 'wss://wot.stubby.dev', 'name' => 'wss://wot.stubby.dev', 'available' => true ],
            [ 'url' => 'wss://xmr.rocks', 'name' => 'wss://xmr.rocks/', 'available' => true ],
            [ 'url' => 'wss://wot.siamstr.com', 'name' => 'wss://wot.siamstr.com', 'available' => true ],
            [ 'url' => 'wss://eden.nostr.land', 'name' => 'wss://eden.nostr.land', 'available' => true ],
            [ 'url' => 'wss://nostr.oxtr.dev', 'name' => 'wss://nostr.oxtr.dev', 'available' => true ],
            [ 'url' => 'wss://relay.yarke.eu', 'name' => 'wss://relay.yarke.eu', 'available' => true ],
            [ 'url' => 'wss://relay.momostr.pink', 'name' => 'wss://relay.momostr.pink', 'available' => true ],
            [ 'url' => 'wss://purplerelay.com', 'name' => 'wss://purplerelay.com', 'available' => true ],
            [ 'url' => 'wss://relayer.fiatjaf.com', 'name' => 'wss://relayer.fiatjaf.com', 'available' => true ],
            [ 'url' => 'wss://relay.nimo.cash', 'name' => 'wss://relay.nimo.cash', 'available' => true ],
            [ 'url' => 'wss://njump.me', 'name' => 'wss://njump.me', 'available' => true ],
            [ 'url' => 'wss://relay.exit.pub', 'name' => 'wss://relay.exit.pub', 'available' => true ],
            [ 'url' => 'wss://relay.nostr.org', 'name' => 'wss://relay.nostr.org', 'available' => true ],
            [ 'url' => 'wss://relay.hawties.xyz', 'name' => 'wss://relay.hawties.xyz', 'available' => true ],
            [ 'url' => 'wss://relay.nostrich.land', 'name' => 'wss://relay.nostrich.land', 'available' => true ],
            [ 'url' => 'wss://rss.nos.social', 'name' => 'wss://rss.nos.social', 'available' => true ],
            [ 'url' => 'wss://nostr.zkid.social', 'name' => 'wss://nostr.zkid.social', 'available' => true ],
            [ 'url' => 'wss://us.nostr.land', 'name' => 'wss://us.nostr.land', 'available' => true ],
            [ 'url' => 'wss://nostr.fbxl.net', 'name' => 'wss://nostr.fbxl.net', 'available' => true ],
            [ 'url' => 'wss://global.relay.red', 'name' => 'wss://global.relay.red', 'available' => true ],
            [ 'url' => 'wss://relay.nostrified.org', 'name' => 'wss://relay.nostrified.org', 'available' => true ],
            [ 'url' => 'wss://relay.nostrss.re', 'name' => 'wss://relay.nostrss.re', 'available' => true ],
            [ 'url' => 'wss://nostr.vulpem.com', 'name' => 'wss://nostr.vulpem.com', 'available' => true ],
            [ 'url' => 'wss://relay.haths.cc', 'name' => 'wss://relay.haths.cc', 'available' => true ],
            [ 'url' => 'wss://nostr.filmweb.pl', 'name' => 'wss://nostr.filmweb.pl', 'available' => true ],
            [ 'url' => 'wss://nostr.thank.eu', 'name' => 'wss://nostr.thank.eu', 'available' => true ],
            [ 'url' => 'wss://nostr.dncn.xyz', 'name' => 'wss://nostr.dncn.xyz', 'available' => true ],
            [ 'url' => 'wss://nostr.petrkr.net', 'name' => 'wss://nostr.petrkr.net', 'available' => true ],
            [ 'url' => 'wss://live.snort.social', 'name' => 'wss://live.snort.social', 'available' => true ],
            [ 'url' => 'wss://relay.nostr.express', 'name' => 'wss://relay.nostr.express', 'available' => true ],
            [ 'url' => 'wss://nostr.utxo.lol', 'name' => 'wss://nostr.utxo.lol', 'available' => true ],
            [ 'url' => 'wss://relay.zeh.app', 'name' => 'wss://relay.zeh.app', 'available' => true ],
            [ 'url' => 'wss://nostr.arguflow.gg', 'name' => 'wss://nostr.arguflow.gg', 'available' => true ],
            [ 'url' => 'wss://nostr.sept.ml', 'name' => 'wss://nostr.sept.ml', 'available' => true ],
            [ 'url' => 'wss://nostr.rocket-tech.net', 'name' => 'wss://nostr.rocket-tech.net', 'available' => true ],
            [ 'url' => 'wss://nostr.globals.fans', 'name' => 'wss://nostr.globals.fans', 'available' => true ],
            [ 'url' => 'wss://nostr.bitcoinist.org', 'name' => 'wss://nostr.bitcoinist.org', 'available' => true ],
            [ 'url' => 'wss://relay.nostrid.com', 'name' => 'wss://relay.nostrid.com', 'available' => true ]
        ]);
    }
}
