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
            [ 'url' => 'wss://relay.damus.io/', 'name' => 'wss://relay.damus.io/', 'active' => true ],
            [ 'url' => 'wss://relay.nostr.bg/', 'name' => 'wss://relay.nostr.bg/', 'active' => true ],
            [ 'url' => 'wss://nostr.oxtr.dev/', 'name' => 'wss://nostr.oxtr.dev/', 'active' => true ],
            [ 'url' => 'wss://nostr.mom/', 'name' => 'wss://nostr.mom/', 'active' => true ],
            [ 'url' => 'wss://nos.lol/', 'name' => 'wss://nos.lol/', 'active' => true ],
            [ 'url' => 'wss://relay.snort.social/', 'name' => 'wss://relay.snort.social/', 'active' => true ],
            [ 'url' => 'wss://relay.nostr.com.au/', 'name' => 'wss://relay.nostr.com.au/', 'active' => true ],
            [ 'url' => 'wss://puravida.nostr.land/', 'name' => 'wss://puravida.nostr.land/', 'active' => true ],
            [ 'url' => 'wss://nostr.wine/', 'name' => 'wss://nostr.wine/', 'active' => true ],
            [ 'url' => 'wss://nostr.inosta.cc/', 'name' => 'wss://nostr.inosta.cc/', 'active' => true ],
            [ 'url' => 'wss://atlas.nostr.land/', 'name' => 'wss://atlas.nostr.land/', 'active' => true ],
            [ 'url' => 'wss://relay.nostr.band/', 'name' => 'wss://relay.nostr.band/', 'active' => true ],
            [ 'url' => 'wss://filter.nostr.wine/', 'name' => 'wss://filter.nostr.wine/', 'active' => true ],
            [ 'url' => 'wss://relay.noswhere.com/', 'name' => 'wss://relay.noswhere.com/', 'active' => true ],
            [ 'url' => 'wss://atlas.nostr.land', 'name' => 'wss://atlas.nostr.land', 'active' => true ],
            [ 'url' => 'wss://relay.nostr.net', 'name' => 'wss://relay.nostr.net', 'active' => true ],
            [ 'url' => 'wss://relay.primal.net', 'name' => 'wss://relay.primal.net', 'active' => true ],
            [ 'url' => 'wss://creatr.nostr.wine', 'name' => 'wss://creatr.nostr.wine', 'active' => true ],
            [ 'url' => 'wss://nostr.milou.lol/ ', 'name' => 'wss://nostr.milou.lol/ ', 'active' => true ],
            [ 'url' => 'wss://relay.nostr.pt', 'name' => 'wss://relay.nostr.pt', 'active' => true ],
            [ 'url' => 'wss://nostr.zebedee.cloud/', 'name' => 'wss://nostr.zebedee.cloud/', 'active' => true ],
            [ 'url' => 'wss://nostr.land', 'name' => 'wss://nostr.land', 'active' => true ],
            [ 'url' => 'wss://snort.social', 'name' => 'wss://snort.social', 'active' => true ],
            [ 'url' => 'wss://relayable.org', 'name' => 'wss://relayable.org', 'active' => true ],
            [ 'url' => 'wss://nostria.space', 'name' => 'wss://nostria.space', 'active' => true ],
            [ 'url' => 'wss://coracle.social', 'name' => 'wss://coracle.social', 'active' => true ],
            [ 'url' => 'wss://astral.ninja', 'name' => 'wss://astral.ninja', 'active' => true ],
            [ 'url' => 'wss://bitcoin.social/', 'name' => 'wss://bitcoin.social/', 'active' => true ],
            [ 'url' => 'wss://relay.poster.place/', 'name' => 'wss://relay.poster.place/', 'active' => true ],
            [ 'url' => 'wss://cobrafuma.com/relay', 'name' => 'wss://cobrafuma.com/relay', 'active' => true ],
            [ 'url' => 'wss://nostrua.com', 'name' => 'wss://nostrua.com', 'active' => true ],
            [ 'url' => 'wss://nostr.cercatrova.me/', 'name' => 'wss://nostr.cercatrova.me/', 'active' => true ],
            [ 'url' => 'wss://relay.hodl.ar/', 'name' => 'wss://relay.hodl.ar/', 'active' => true ],
            [ 'url' => 'wss://nostrgram.co', 'name' => 'wss://nostrgram.co', 'active' => true ],
            [ 'url' => 'wss://e.nos.lol/', 'name' => 'wss://e.nos.lol/', 'active' => true ],
            [ 'url' => 'wss://nostrelites.org', 'name' => 'wss://nostrelites.org', 'active' => true ],
            [ 'url' => 'wss://relay.0xchat.com', 'name' => 'wss://relay.0xchat.com', 'active' => true ],
            [ 'url' => 'wss://relay.nosflare.com/', 'name' => 'wss://relay.nosflare.com/', 'active' => true ],
            [ 'url' => 'wss://wot.utxo.one', 'name' => 'wss://wot.utxo.one', 'active' => true ],
            [ 'url' => 'wss://nostr.party', 'name' => 'wss://nostr.party', 'active' => true ],
            [ 'url' => 'wss://relay.lnau.net/', 'name' => 'wss://relay.lnau.net/', 'active' => true ],
            [ 'url' => 'wss://wot.stubby.dev', 'name' => 'wss://wot.stubby.dev', 'active' => true ],
            [ 'url' => 'wss://xmr.rocks/', 'name' => 'wss://xmr.rocks/', 'active' => true ],
            [ 'url' => 'wss://wot.siamstr.com', 'name' => 'wss://wot.siamstr.com', 'active' => true ],
            [ 'url' => 'wss://eden.nostr.land', 'name' => 'wss://eden.nostr.land', 'active' => true ],
            [ 'url' => 'wss://nostr.oxtr.dev', 'name' => 'wss://nostr.oxtr.dev', 'active' => true ],
            [ 'url' => 'wss://relay.yarke.eu', 'name' => 'wss://relay.yarke.eu', 'active' => true ],
            [ 'url' => 'wss://relay.momostr.pink', 'name' => 'wss://relay.momostr.pink', 'active' => true ],
            [ 'url' => 'wss://purplerelay.com', 'name' => 'wss://purplerelay.com', 'active' => true ],
            [ 'url' => 'wss://relayer.fiatjaf.com', 'name' => 'wss://relayer.fiatjaf.com', 'active' => true ],
            [ 'url' => 'wss://relay.nimo.cash', 'name' => 'wss://relay.nimo.cash', 'active' => true ],
            [ 'url' => 'wss://njump.me', 'name' => 'wss://njump.me', 'active' => true ],
            [ 'url' => 'wss://relay.exit.pub', 'name' => 'wss://relay.exit.pub', 'active' => true ],
            [ 'url' => 'wss://relay.nostr.org', 'name' => 'wss://relay.nostr.org', 'active' => true ],
            [ 'url' => 'wss://relay.hawties.xyz', 'name' => 'wss://relay.hawties.xyz', 'active' => true ],
            [ 'url' => 'wss://relay.nostrich.land', 'name' => 'wss://relay.nostrich.land', 'active' => true ],
            [ 'url' => 'wss://rss.nos.social', 'name' => 'wss://rss.nos.social', 'active' => true ],
            [ 'url' => 'wss://nostr.zkid.social', 'name' => 'wss://nostr.zkid.social', 'active' => true ],
            [ 'url' => 'wss://us.nostr.land', 'name' => 'wss://us.nostr.land', 'active' => true ],
            [ 'url' => 'wss://nostr.fbxl.net', 'name' => 'wss://nostr.fbxl.net', 'active' => true ],
            [ 'url' => 'wss://global.relay.red', 'name' => 'wss://global.relay.red', 'active' => true ],
            [ 'url' => 'wss://relay.nostrified.org', 'name' => 'wss://relay.nostrified.org', 'active' => true ],
            [ 'url' => 'wss://relay.nostrss.re', 'name' => 'wss://relay.nostrss.re', 'active' => true ],
            [ 'url' => 'wss://nostr.vulpem.com', 'name' => 'wss://nostr.vulpem.com', 'active' => true ],
            [ 'url' => 'wss://relay.haths.cc', 'name' => 'wss://relay.haths.cc', 'active' => true ],
            [ 'url' => 'wss://nostr.filmweb.pl', 'name' => 'wss://nostr.filmweb.pl', 'active' => true ],
            [ 'url' => 'wss://nostr.thank.eu', 'name' => 'wss://nostr.thank.eu', 'active' => true ],
            [ 'url' => 'wss://nostr.dncn.xyz', 'name' => 'wss://nostr.dncn.xyz', 'active' => true ],
            [ 'url' => 'wss://nostr.petrkr.net', 'name' => 'wss://nostr.petrkr.net', 'active' => true ],
            [ 'url' => 'wss://live.snort.social', 'name' => 'wss://live.snort.social', 'active' => true ],
            [ 'url' => 'wss://relay.nostr.express', 'name' => 'wss://relay.nostr.express', 'active' => true ],
            [ 'url' => 'wss://nostr.utxo.lol', 'name' => 'wss://nostr.utxo.lol', 'active' => true ],
            [ 'url' => 'wss://relay.zeh.app', 'name' => 'wss://relay.zeh.app', 'active' => true ],
            [ 'url' => 'wss://nostr.arguflow.gg', 'name' => 'wss://nostr.arguflow.gg', 'active' => true ],
            [ 'url' => 'wss://nostr.sept.ml', 'name' => 'wss://nostr.sept.ml', 'active' => true ],
            [ 'url' => 'wss://nostr.rocket-tech.net', 'name' => 'wss://nostr.rocket-tech.net', 'active' => true ],
            [ 'url' => 'wss://nostr.globals.fans', 'name' => 'wss://nostr.globals.fans', 'active' => true ],
            [ 'url' => 'wss://nostr.bitcoinist.org', 'name' => 'wss://nostr.bitcoinist.org', 'active' => true ],
            [ 'url' => 'wss://relay.nostrid.com', 'name' => 'wss://relay.nostrid.com', 'active' => true ]
        ]);
    }
}
