<?php
header('Content-type: application/json');
// <!-- Stats Counter -->

$store = json_decode(file_get_contents("stat.json"), true);


function userPrefsForUUID( $uuid ) {
	global $store;
	if ($uuid) {
		return $store["users"][ $uuid ]["preferences"];
	}
}

if (isset($_GET['uuid']) && $_GET['uuid'] != "") {
	$prefs = userPrefsForUUID( $_GET['uuid'] );
	echo json_encode($prefs);
} else { echo 'false'; } // Default value

?>