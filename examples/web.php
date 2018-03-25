<?php

/*
|--------------------------------------------------------------------------
| Laravel Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
 */

Route::group(['prefix' => 'vue-ajax'], function () {
    Route::get('get', function () {
        $data = isset($_GET) ? $_GET : [];
        $data['title'] = 'GET response from server';
        $data['subtitle'] = isset($_GET['relParameter']) ? $_GET['relParameter'] : 'Completed';
        $data['time'] = date("d.m.Y H:i:s");

        return response(json_encode($data), 200)->header('Content-Type', 'application/json; charset=utf-8');
    });

    Route::post('file', function () {
        $images = [];

        if (isset($_FILES['images'])) {

            if (is_array($_FILES['images']['name']) && count($_FILES['images']['name']) > 1) {
                foreach ($_FILES['images']['name'] as $key => $value) {
                    $fileName = $_FILES['images']['name'][$key];
                    $fileType = $_FILES['images']['type'][$key];
                    $fileContent = file_get_contents($_FILES['images']['tmp_name'][$key]);
                    $images[] = [$fileName, 'data:' . $fileType . ';base64,' . base64_encode($fileContent), $fileType];
                }
            } else {
                $fileName = $_FILES['images']['name'];
                $fileType = $_FILES['images']['type'];
                $fileContent = file_get_contents($_FILES['images']['tmp_name']);
                $images[] = [$fileName, 'data:' . $fileType . ';base64,' . base64_encode($fileContent), $fileType];
            }
        }

        $data = isset($_POST) ? $_POST : [];
        $data['title'] = 'File upload response from server';
        $data['subtitle'] = isset($_POST['relParameter']) ? $_POST['relParameter'] : 'Completed';
        $data['time'] = date("d.m.Y H:i:s");
        $data['images'] = $images;

        return response(json_encode($data), 200)->header('Content-Type', 'application/json; charset=utf-8');
    });

    Route::get('jsonp', function () {
        $data = isset($_GET) ? $_GET : [];
        $data['title'] = 'JSONP response from server';
        $data['subtitle'] = isset($_GET['relParameter']) ? $_GET['relParameter'] : 'Completed';
        $data['time'] = date("d.m.Y H:i:s");
        $data['callback'] = isset($data['callback']) ? $data['callback'] : 'callback';

        return response($data['callback'] . '(' . json_encode($data) . ')', 200)->header('Content-Type', 'text/javascript; charset=utf-8');
    });
});