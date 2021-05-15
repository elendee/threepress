<?php

function threepress_LOG( $msg ){

	if( !file_exists( __DIR__ . '/.threepress-log.txt') ){
		return;
	}

	$type = gettype( $msg );
	if( $type  === 'object' || $type === 'array' ){
		$msg = '(' . $type . ')
' . json_encode($msg, JSON_PRETTY_PRINT);
	}
    $logfile = __DIR__ . '/.threepress-log.txt';
    file_put_contents($logfile, date('M:D:H:i') . ' LOG:
' . $msg . PHP_EOL, FILE_APPEND | LOCK_EX);

}	


function threepress_datetime(){
	return gmdate( 'Y-m-d H:i:s', time() );
}


function threepress_sideload( $file, $post_id = 0, $desc = null ){

	if( empty( $file ) ) {
		return new WP_Error( 'error', 'File is empty' );
	}

	$file_array = array();

	// Get filename and store it into $file_array
	// Add more file types if necessary
	preg_match( '/[^\?]+\.(glb)\b/i', $file, $matches ); // jpe?g|jpe|gif|png|pdf
	$file_array['name'] = basename( $matches[0] );

	// Download file into temp location.
	$file_array['tmp_name'] = download_url( $file );

	// If error storing temporarily, return the error.
	if ( is_wp_error( $file_array['tmp_name'] ) ) {
		return new WP_Error( 'error', 'Error while storing file temporarily' );
	}

	// Store and validate
	$id = media_handle_sideload( $file_array, $post_id, $desc );

	// Unlink if couldn't store permanently
	if ( is_wp_error( $id ) ) {
		unlink( $file_array['tmp_name'] );
		return new WP_Error( 'error', "Couldn't store upload permanently" );
	}

	if ( empty( $id ) ) {
		return new WP_Error( 'error', "Upload ID is empty" );
	}

	return $id;

}