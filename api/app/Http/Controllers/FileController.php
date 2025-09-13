<?php

namespace App\Http\Controllers;

use App\File;
use App\Http\Request\SearchRequest;

class FileController extends Controller
{
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
}
