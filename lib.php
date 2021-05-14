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

