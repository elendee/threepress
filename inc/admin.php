<?php

    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    ?>

    <div class="wrap threepress">

        <h1><?php echo esc_html( $threepress_page_title ); ?></h1>
        <?php 
        // echo sd_admin_settings_page(); 
        ?>
        <div class='nav-tab-wrapper'>
    	<a class='nav-tab' data-section='model-library'>
    		model library
    	</a>
    	<a class='nav-tab' data-section='model-galleries'>
    		model galleries
    	</a>
    	<a class='nav-tab' data-section='guide'>
    		guide
    	</a>

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
<!-- 		        		<input type='text' name='display-name' placeholder='display name'>
		        		<textarea name='description' placeholder='description'></textarea>
		        		<div class='clarification'>filenames must be unique</div>
			    		<input name='model' type='file'> -->
			    		<?php //submit_button( __('upload', 'textdomain' ) ); ?>
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

		    <?php require_once 'gallery-form.php'; ?>

        	<h4>galleries</h4>
		   	<div class='content'>
        	</div>

        </div>




        <div id='guide' class='section'>
        	<h1><a href="https://github.com/elendee/threepress#readme" target="_blank">Github readme</a></h1>
        </div>





    </div>
