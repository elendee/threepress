<?php

    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    ?>

    <div class="wrap threepress">

    	<?php do_action('threepress_admin_menu'); ?>

    </div>








    <div id='model-library' class='section'>
    	
    	<h3>
    		add a model
    		<div class='threepress-toggle-wrapper'>
	        	<div id='add-toggle' class='threepress-toggle threepress-button'>
	        		<div>
	        			+
	        		</div>
	        	</div>
	        </div>
    	</h3>

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

    	<h3>library</h3>
    	<div class='content' data-stackable=true>
    	</div>

    </div>








    <div id='model-galleries' class='section'>

    	<h3>
    		create gallery shortcode
    		<div class='threepress-toggle-wrapper'>
	        	<div id='create-toggle' class='threepress-toggle threepress-button'>
	        		<div>
	        			+
	        		</div>
	        	</div>
	        </div>
	    </h3>

	    <div id='gallery-container'></div>

    	<h3>galleries</h3>
    	<div class='clarification'>click row to edit</div>
	   	<div class='content' data-stackable=true>
    	</div>

    </div>



    <div id='tab-games' class='section'>
    	<div id='server-messaging'>
    	</div>

    </div>


    <div id='model-extensions' class='section'>
    	<h3>
    		Extensions: <!--a href="https://threepress.shop/product-category/extension/" target="_blank">https://threepress.shop/extensions</a-->
    	</h3>
    	<i>Extensions currently unavailable</i>
    	<h4>Your installed extensions:</h4>
    	<div id='extension-menu' class='nav-tab-wrapper'>
	    	<?php do_action('threepress_list_ext_menu'); ?>
	    	<div class='clearfloat'></div>
	    </div>
	    <div id='extension-content'>
	    	<?php do_action('threepress_list_ext_content'); ?>
	    </div>
    </div>



    <div id='model-help' class='section'>
    	<p>
    		<a target='_blank' rel='nofollow' href='https://discord.gg/pR4EEUU6Ca'>Discord</a>
    	</p>
    	<p>
			<a target='_blank' rel='nofollow' href='https://wordpress.org/plugins/threepress/'>README and forums</a>
		</p>
    </div>




</div>
