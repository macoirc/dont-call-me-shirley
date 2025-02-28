<?php

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['scrape'])) {
    $url = 'https://lookaround-cache-prod.streaming.siriusxm.com/playbackservices/v1/live/lookAround';
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['backup'])) {
    $backup = filter_input(INPUT_GET, 'backup', FILTER_SANITIZE_SPECIAL_CHARS);
    $url = 'https://xmplaylist.com/api/station/' . $backup;
} else {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Method not implemented.']);
    exit;
}

$UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47';
$options = [
    'http' => [
        'header' => [
            'User-Agent: ' . $UA,
            'Cache-Control: max-age=60',
            'Accept: application/json',
        ],
        'method' => 'GET'
    ],
];
$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);
if ($response === false) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Failed to retrieve data']);
    exit;
}
header('Content-Type: application/json; charset=utf-8');
echo $response;
?>