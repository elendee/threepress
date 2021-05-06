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
        		<div class='threepress-button-wrapper'>
		        	<div id='add-toggle' class='threepress-button'>
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
        		<div class='threepress-button-wrapper'>
		        	<div id='create-toggle' class='threepress-button'>
		        		<div>
		        			+
		        		</div>
		        	</div>
		        </div>
		    </h4>
	    	<form id='gallery-form' action='create-gallery.php' method='post'>
	    		<h4>gallery name</h4>
	    		<p>
		    		<input name='name' type='text' placeholder='<?php echo __('gallery name (not displayed publicly)', 'textdomain'); ?>'/>
		    	</p>
	    		<h4>gallery model</h4>
		    	<p>
		    		<div id='model-choice'></div>
		    		<div id='choose-model' class='button button-primary'>
			    		choose a model
			    	</div>
		    	</p>
		    	<h4>gallery shortcode</h4>
		    	<p>
		    		<input id='shortcode' type='text' placeholder='generated shortcode will appear here' readonly/>
		    	</p>
	    		<p>
		    		<input type='submit' id='create-gallery' class='button button-primary'/>
		    	</p>
        	</form>

        	<h4>galleries</h4>
		   	<div class='content'>
        	</div>

        </div>

        <div id='guide' class='section'>
        	<p>
	        	<h3>Threepress lets you upload 3d models, then quickly customize where they are displayed.</h3>
	        </p>
        	<p>
    			<b>Use Post and Product pages to control the display of Featured Images / Models.</b>
    		</p>
    		<p>
    			<b>Create gallery shortcodes to display models anywhere throughout the site.</b>
    		</p>
    		<p>
    			Models must be in ".glb" format - most 3d programs can export to this.  They are stored in the Media Library like everything else, but can be found easily through the Threepress library, which simply filters for ".glb" extensions.
    		</p>
        </div>

    </div>
