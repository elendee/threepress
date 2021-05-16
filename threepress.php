<?php
/**
 * Plugin Name: Threepress 
 * Plugin URI: https://threepress.shop
 * Version: 0.1
 * Description: Generate 3D gallery shortcodes powered by three.js
 * Text Domain: threepress
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */

/*
Threepress is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.
 
Threepress is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
 
You should have received a copy of the GNU General Public License
along with Threepress. If not, see https://www.gnu.org/licenses/.
*/


if ( !defined('ABSPATH') ) { 
    die;
}

if ( !defined('DS') ) { define( 'DS', DIRECTORY_SEPARATOR ); }

require_once( ABSPATH . 'wp-includes/pluggable.php' );

require_once( __DIR__ . '/inc/gallery-form.php' );

$threepress_dir = plugins_url( '', __FILE__ );



if ( !class_exists( 'Threepress' ) ) {

	abstract class Threepress{

	    public static function activate(){
			global $wpdb;

	    	$sql = $wpdb->prepare('SHOW TABLES LIKE "threepress_shortcodes"');
	    	$has_table = $wpdb->query( $sql );
	    	
	    	if( $has_table ){  // Threepress has been previously activated

				// Threepress::LOG('reactivating Threepress; skipping init sequence');

			}else{ // Threepress install procedures

				// database
		    	$sql = $wpdb->prepare('
		    		CREATE TABLE IF NOT EXISTS threepress_shortcodes (
		    		id int(11) NOT NULL auto_increment PRIMARY KEY,
		    		author_key int(11),
		    		name varchar(255),
		    		created datetime,
		    		edited datetime,
		    		shortcode text )');
		    	$results = $wpdb->query( $sql );	    		

		    	$starters = new stdClass();
		    	$starters->bmw = [
		    		'bmw', 
		    		'Sample BMW for Threepress', 
		    		'BMW E36 Low Poly by <a target="_blank" href="https://sketchfab.com/marooned3d">Constantine Tvalashvili</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a>'
		    	];

		    	foreach ($starters as $key => $value) {
		    		Threepress::load_starter( $value[0], $value[1], $value[2] );
		    	}

	    	}

	    }


 	    public static function global_scripts() {
    		wp_enqueue_style( 
				'threepress-global-css', 
				plugins_url('/static/css/global.css', __FILE__ ), 
				array()
			);
			wp_enqueue_style( 
				'threepress-modal-css', 
				plugins_url('/static/css/modal.css', __FILE__ ), 
				array()
			);	    	
    		wp_enqueue_script( 
				'threepress-global-js', 
				plugins_url( '/static/js/global.js', __FILE__ ),
				array('jquery')
			);

			wp_localize_script( 'threepress-global-js', 'THREEPRESS', array(
					'plugin_url' => plugins_url( '', __FILE__ ), //plugins_url(), // '/static/js/global.js', __FILE__
					'home_url' => home_url(),
					'ajaxurl' => admin_url( 'global-ajax.php' ),
				)
			);

	    }


	    public static function load_starter( $slug, $title, $caption ) {

	    	// starter model
	    	global $wpdb;
	 		$starter = plugins_url( '/starter-models/' . $slug . '.glb', __FILE__ );
			$starter_id = Threepress::sideload( $starter, null, $title, array( 'post_excerpt' => wp_kses_post( $caption ) ) );
			if( gettype( $starter_id ) === 'integer' ){
				$now = Threepress::datetime();
				$sql = $wpdb->prepare(
					'INSERT INTO threepress_shortcodes ( author_key, name, created, edited, shortcode ) 
					VALUES (%d, %s, %s, %s, %s)', 
					get_current_user_id(), 
					sanitize_text_field( $title ),
					$now, 
					$now, 
					'[threepress model_id=' . $starter_id . ' controls="orbit" light=directional intensity=5 camera_dist=5 zoom_speed=5 rotate_y=true bg_color=linear-gradient(45deg,lightblue,white)]' 
				);				
				$res = $wpdb->query($sql);

			}else{
				Threepress::LOG( $id ); // error
			} 
	    }


	    public static function base_scripts() {
    		wp_enqueue_script( 
				'threepress-base-js', 
				plugins_url( '/static/js/init_base.js', __FILE__ ),
				array() // 'jquery'
			);
	    }


	    public static function admin_scripts() {
    		wp_enqueue_style( 
				'threepress-admin-css', 
				plugins_url('/static/css/admin.css', __FILE__ ), 
				array()
			);

    		wp_enqueue_script( 
				'threepress-admin-js', 
				plugins_url( '/static/js/init_admin.js', __FILE__ ),
				array('jquery')
			);

	    }


	    public static function filter_modules( $tag, $handle, $src ) {
	    	$defer_modules = ['threepress-admin-js', 'threepress-posts-js', 'threepress-lib-js', 'threepress-base-js'];
		    if ( !in_array($handle, $defer_modules ) ){
		        return $tag;		    	
		    }
		    $tag = '<script type="module" src="' . $src . '" defer="defer"></script>';
		    return $tag;
		}


	    public static function options_page() {
			$threepress_page_title = 'Threepress';
			$threepress_menu_title = 'Threepress';
			$threepress_capability = 'administrator';
			$threepress_menu_slug = 'inc/admin.php';

			add_menu_page(
			    $threepress_page_title,
			    $threepress_menu_title,
			    $threepress_capability,
			    plugin_dir_path(__FILE__) . $threepress_menu_slug,
			    null,
			    false,
			    20
			);	
	    }


	    public static function shortcode( $attr, $content, $name ){

	    	$model_id = (int)$attr['model_id'];

	    	if( gettype( $model_id ) !== 'integer' ){

	    		$attr['invalid'] = true;

	    	}else{

	    		global $wpdb;
	    		$sql = $wpdb->prepare('SELECT * FROM wp_posts WHERE id=%d', $model_id );
	    		$results = $wpdb->get_results( $sql );
	    		$attr['model'] = $results[0];

	    	}

	    	$id = '';

	    	if( $attr['name'] ){
	    		$id = 'id="threepress-gallery-' . $attr['name'] . '"';
	    	}

	    	Threepress::LOG( $attr );

	    	$attr['model']->post_excerpt = ''; // shim - it can contain values that break JSON.parse - fix later

	    	return '<div ' . $id . ' class="threepress-gallery"><div class="threepress-gallery-data">' . json_encode($attr) . '</div></div>';
	    	// return '<div ' . $id . ' class="threepress-gallery"><div class="threepress-gallery-data">' . $attr['shortcode'] . '</div></div>';

	    }



	    // ajax
	    public static function fill_library(){
			global $wpdb;
			$sql = $wpdb->prepare('SELECT * FROM wp_posts 
				WHERE post_type="attachment" AND guid LIKE "%.glb%" ORDER BY id DESC');

			$rows = $wpdb->get_results( $sql );
			wp_send_json( $rows );

	    }


	    public static function fill_gallery(){

			global $wpdb;
			$id = get_current_user_id();

			$sql2 = $wpdb->prepare('SELECT * FROM threepress_shortcodes WHERE author_key=%d ORDER BY edited DESC', $id);
			$rows = $wpdb->get_results( $sql2 );
			wp_send_json( $rows ); 

		}


		 public static function delete_gallery(){

			global $wpdb;
			$response = new stdClass();
			$id = $_POST['id'];
			if( !is_numeric($id) ){
				$response->success = false;
				$response->msg ='invalid id';
			}else{
				$sql = $wpdb->prepare('DELETE FROM threepress_shortcodes WHERE id=%d', $id );
				$res = $wpdb->query( $sql );
				$response->success = true;				
			}

			wp_send_json( $response );

		}


	    public static function save_shortcode(){

	    	global $wpdb;

	    	$res = new stdClass();
	    	$res->success = false;

	    	$gallery = new stdClass();
	    	$gallery->datetime = Threepress::datetime();
	    	$gallery->user_id = get_current_user_id();
	    	$gallery->name = sanitize_text_field( $_POST['name'] );
	    	$gallery->shortcode = sanitize_text_field( $_POST['shortcode'] );
	    	// edit
	    	if( $_POST['shortcode_id'] ){

		    	if( !is_numeric( $_POST['shortcode_id'] ) ) wp_die( json_encode($res) );

	    		$sql = $wpdb->prepare('UPDATE threepress_shortcodes SET name=%s, edited=%s, shortcode=%s WHERE author_key=%d AND id=%d', $gallery->name, $gallery->datetime, $gallery->shortcode, $gallery->user_id, $_POST['shortcode_id']);
	    		$results = $wpdb->query( $sql );
	    		
	    		if( $results ) $gallery->id = $_POST['shortcode_id'];
    		
    		// create
	    	}else{ 
		    	$results = $wpdb->insert('threepress_shortcodes', array(
		    		'author_key' => $gallery->user_id,
		    		'name' => $gallery->name,
		    		'edited' => $gallery->datetime,
		    		'created' => $gallery->datetime,
		    		'shortcode' => $gallery->shortcode,
		    	));

		    	$gallery->created = $gallery->datetime;
			    $gallery->id = $wpdb->insert_id;

	    	}

	    	$gallery->edited = $gallery->datetime;
	    	$res->gallery = $gallery;

	    	$res->success = true;

	    	wp_send_json( $res );

		}


	    public static function get_model(){
			global $wpdb;

			$res = new stdClass();
			$res->success = false;

			$id = $_POST['id'];

			if( is_numeric($id) ){
				$post = get_post( $id );
				if( $post ){
					$res->success = true;
					$res->model = $post;
				}
			}

			wp_send_json( $res );

		}


		public static function allow_glb( $mimes ){
			$mimes['glb'] = 'application/octet-stream';
			return $mimes;
		}



		public static function LOG( $msg ){

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


		public static function datetime(){
			return gmdate( 'Y-m-d H:i:s', time() );
		}


		public static function sideload( $file, $post_id = 0, $desc = null, $post_data ){

			if( empty( $file ) ) {
				return new WP_Error( 'error', 'File is empty' );
			}

			if( empty( $post_data ) ) $post_data = [];

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
			$id = media_handle_sideload( $file_array, $post_id, $desc, $post_data );

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
	


	}

	$has_module = false;

	// --------------------------------------------- admin init

	if( current_user_can('manage_options') ){

		$threepress = strpos( $_SERVER['REQUEST_URI'], 'page=threepress' );
		$admin_ajax = strpos( $_SERVER['REQUEST_URI'], 'wp-admin/admin-ajax' );		
		$post_edit = strpos( $_SERVER['REQUEST_URI'], 'wp-admin/post.php');

		if( $threepress ){ // _____ admin page

			add_action( 'admin_enqueue_scripts', 'Threepress::admin_scripts', 100 );
			add_action( 'threepress_gallery_form', 'threepress_gallery_form');
			$has_module = true;

		}else if( $admin_ajax ){ // _____ ajax requests

			add_action( 'wp_ajax_fill_library', 'Threepress::fill_library' );
			add_action( 'wp_ajax_fill_gallery', 'Threepress::fill_gallery' );
			add_action( 'wp_ajax_save_shortcode', 'Threepress::save_shortcode' );
			add_action( 'wp_ajax_delete_gallery', 'Threepress::delete_gallery' );
			add_action( 'wp_ajax_get_model', 'Threepress::get_model' );

		}

	}

	// -------------------------------------------- global init

	add_action('init', 'Threepress::global_scripts', 100);
	add_action('admin_menu', 'Threepress::options_page');
	if( !$has_module ) add_action('init', 'Threepress::base_scripts', 100);

	add_filter('script_loader_tag', 'Threepress::filter_modules' , 10, 3);
	add_filter('upload_mimes', 'Threepress::allow_glb');

	add_shortcode('threepress', 'Threepress::shortcode');

	register_activation_hook( __FILE__, 'Threepress::activate' );

}




