<?php
$post = file_get_contents('php://input');
if (file_put_contents("wghtData.json", $post))
    echo "JSON file created successfully...";
else 
    echo "Oops! Error creating json file...";
?>