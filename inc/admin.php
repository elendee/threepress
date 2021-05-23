<?php

    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    ?>

    <div class="wrap threepress">

    	<?php do_action('threepress_admin_menu'); ?>

    </div>








    <div id='model-library' class='section'>
    	
    	<h4>
    		add a model
    		<div class='threepress-toggle-wrapper'>
	        	<div id='add-toggle' class='threepress-toggle'>
	        		<div>
	        			+
	        		</div>
	        	</div>
	        </div>
    	</h4>

    	<div id='threepress-upload-types'>

        	<div class='upload-type'>
	        	<form id='browse-threepress' action='#'>
	        		<div class='title'>download from Threepress</div>
	        		<p class='clarification'>all Threepress models guaranteed compatible</p>
	        		<a href="https://threepress.shop" target="_blank" class="button button-primary">
	        			browse
			    	</a>
	        	</form>
	        </div>

    		<div class='upload-type'>
    			<form id='upload-model'>
	        		<div class='title'>upload a model</div>
	        		<p class='clarification'>use the Media Library to upload <b>.glb</b> files</p>
	        		<?php submit_button( __('media library', 'textdomain')) ?>
	        	</form>
	        </div>
        </div>

    	<h4>library</h4>
    	<div class='content'>
    	</div>

    </div>








    <div id='model-galleries' class='section'>

    	<h4>
    		create gallery shortcode
    		<div class='threepress-toggle-wrapper'>
	        	<div id='create-toggle' class='threepress-toggle'>
	        		<div>
	        			+
	        		</div>
	        	</div>
	        </div>
	    </h4>

		<?php do_action('threepress_gallery_form'); ?>

    	<h4>galleries</h4>
    	<div class='clarification'>click row to edit</div>
	   	<div class='content'>
    	</div>

    </div>





</div>
