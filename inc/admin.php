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
	    		
	    		<div class='gallery-section'>
		    		<h4>gallery name</h4>
		    		<p>
			    		<input name='gallery_name' type='text' placeholder='<?php echo __('gallery name (not displayed publicly)', 'textdomain'); ?>'/>
			    	</p>
			    </div>
	    		

	    		<div class='gallery-section'>
		    		<h4>gallery model</h4>
			    	<p>
			    		<div id='model-choice'></div>
			    		<div id='choose-model' class='button button-primary'>
				    		choose a model
				    	</div>
			    	</p>
			    </div>

	    		<div class='gallery-section'>
			    	<h4>gallery options</h4>
			    	<div class="clarification">(in dev)</div>
			    	<div id='gallery-options' class='threepress-disabled'>
			    		<div class='gallery-option'>
			    			
			    			<h4>controls:</h4>
			    			<label>user</label>
			    			<input name='options-controls' type='radio' value='user'>
			    			<label>auto orbit</label>
			    			<input name='options-controls' type='radio' value='auto-orbit'>
			    			<label>none</label>
			    			<input name='options-controls' type='radio' value='none'>
			    			
			    			<h4>light:</h4>
			    			<label>sun</label>
			    			<input name='options-light' type='radio' value='sun'>
			    			<label>directional</label>
			    			<input name='options-light' type='radio' value='directional'>
			    			<label>hemispherical</label>
			    			<input name='options-light' type='radio' value='hemispherical'>

			    			<h4>camera distance:</h4>
			    			<input type='range' min=1 max=1000 name='camera-dist'>

			    		</div>
			    	</div>
			    </div>
		    	
	    		<div class='gallery-section'>
			    	<h4>gallery shortcode</h4>
			    	<p>
			    		<input id='shortcode' type='text' placeholder='generated shortcode will appear here' readonly/>
			    	</p>
			    </div>

	    		<p>
		    		<input type='submit' id='create-gallery' class='button button-primary'/>
		    	</p>

        	</form>

        	<h4>galleries</h4>
		   	<div class='content'>
        	</div>

        </div>




        <div id='guide' class='section'>

        	<h2><a href="https://github.com/elendee/threepress#readme" target="_blank">view the readme on Github</a></h2>
        </div>





    </div>
