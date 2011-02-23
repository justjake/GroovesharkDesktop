<?php
header('Content-type: text/plain');
// <!-- Stats Counter -->

$store = json_decode(file_get_contents("stat.json"), true);
$incoming = json_decode(file_get_contents("php://input"), true);
$dummyUser = array(
			"longname" => "Jake Teton-Landis",
 			"uuid" => "4AFE3CE5-7774-4883-91EC-15B77C9F29B7",
 			"email" => NULL);

function output( $full ) {
	global $store, $incoming;
	echo "Store: \n";
	if ($full) { 
		var_dump($store); 
		echo "Incoming: \n";
		var_dump($incoming);
	} else {
		echo(count($store["users"])); 
		echo "\n";
	}
}

function writeUser( $user ) {
	global $store;
	if ($user) {
		$store["users"][ $user["uuid"] ] = $user;
	} 
}

function userPrefsForUUID( $uuid ) {
	global $store;
	if ($uuid) {
		return $store["users"][ $uuid ]["preferences"];
	}
}

function saveStore() {
	global $store;
	file_put_contents('stat.json', json_encode($store));
}

//writeUser( $dummyUser );
if ($incoming) {
	writeUser( $incoming );
	saveStore();
	output( false );
}

if (isset($_GET['display']) && $_GET['display'] != "") {
  if ($_GET['display'] == "usercount") {
    output(false);
  }
  if ($_GET['display'] == "dump") {
    output(true);
  }
}
?>