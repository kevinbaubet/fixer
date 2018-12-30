<?php
    $itemPerPage = (isset($_GET['rows'])) ? $_GET['rows'] : 0;
    $start = (isset($_GET['offset'])) ? $_GET['offset'] : -1;
    $out = [];

    if ($itemPerPage > 0 && $start >= 0) {
        $i = 1;
        for ($i; $i <= $itemPerPage; $i++) {
            $out[] = 'Item ' . ($start + $i);
        }
    }

    echo json_encode($out);
?>