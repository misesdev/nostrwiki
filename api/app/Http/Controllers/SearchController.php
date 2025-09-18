<?php

namespace App\Http\Controllers;

use App\File;
use App\Http\Request\AutoCompleteRequest;
use App\Http\Request\SearchRequest;
use App\Http\Request\UserSearchRequest;
use App\Note;
use App\Relay;
use App\User;
use Illuminate\Support\Facades\Http;

class SearchController extends Controller
{
    function autocomplete(AutoCompleteRequest $request) 
    {
        $term = $request->term;

        // Buscar nos índices 'notes' e 'user'
        $indices = 'notes,users';
        $elasticUrl = env('ELASTIC_URL', 'http://elasticsearch:9200');
        $response = Http::post("$elasticUrl/$indices/_search", [
            'size' => 10,
            'query' => [
                'multi_match' => [
                    'query' => $term,
                    'fields' => [
                        'content^2', 
                        'published_by^3', 
                        'tags',       // for notes
                        'name^2', 
                        'display_name^3', 
                        'about'       // for users
                    ],
                    'type' => 'bool_prefix'
                ]
            ]
        ]);
        return $response->json();
    }

    /**
     * @response Relay[] // 1 - PHPDoc
     */
    function search_relays(SearchRequest $request)
    {
        $term = $request->term;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $relays = Relay::search($term, $skip, $take)->get();

        return response()->json($relays, 200);
    }

    /**
     * @response Note[] // 1 - PHPDoc
     */
    function search_notes(SearchRequest $request)
    {
        $term = $request->term;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $notes = Note::search($term, $skip, $take)->get();

        return response()->json($notes);
    }

    /**
     * @response File[] // 1 - PHPDoc
     */
    function search_images(SearchRequest $request)
    {
        $term = $request->term;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $images = File::search($term, 'image', $skip, $take)->get();

        return response()->json($images, 200);
    }

    /**
     * @response File[] // 1 - PHPDoc
     */
    function search_videos(SearchRequest $request)
    {
        $term = $request->term;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $videos = File::search($term, 'video', $skip, $take)->get();

        return response()->json($videos, 200);
    }

    /**
     * @response File[] // 1 - PHPDoc
     */
    function search_files(SearchRequest $request)
    {
        $term = $request->term;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $files = File::searchfile($term, $skip, $take)->get();

        return response()->json($files, 200);
    }

    /**
     * @response User[] // 1 - PHPDoc
     */
    function search_users(SearchRequest $request)
    {
        $term = $request->term;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $users = User::search($term, $skip, $take)->get();

        return response()->json($users, 200);
    }

    /**
     * @response User[] // 1 - PHPDoc
     */
    function search_user_friends(UserSearchRequest $request)
    {
        $term = $request->term;
        $pubkey = $request->pubkey;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $user = User::find($pubkey);

        if(!$user) return response()->json(['message' => 'user not found'], 404);

        $friends = $user->searchFriends($term, $skip, $take)->get();

        return response()->json($friends, 200);
    }

    /**
     * @response Note[] // 1 - PHPDoc
     */
    function search_user_notes(UserSearchRequest $request)
    {
        $term = $request->term;
        $pubkey = $request->pubkey;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 75);

        $user = User::find($pubkey);

        if(!$user) return response()->json(['message' => 'user not found'], 404);

        $notes = $user->searchNotes($term, $skip, $take)->get();

        return response()->json($notes, 200);
    }
}
