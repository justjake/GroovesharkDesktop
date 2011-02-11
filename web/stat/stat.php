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
	if ($full) { var_dump($store); }
	else {
		echo(count($store["users"])); 
		echo "\n";
	}
	echo "Incoming: \n";
	if ($full) var_dump($incoming);
}

function writeUser( $user ) {
	global $store;
	if ($user) {
		$store["users"][ $user["uuid"] ] = $user;
	} 
}

function saveStore() {
	global $store;
	file_put_contents('stat.json', json_encode($store));
}

//writeUser( $dummyUser );
writeUser( $incoming );
saveStore();

output( false );

?>