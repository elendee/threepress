<?php

function threepress_gallery_form(){

	?>

	<form id='gallery-form' action='create-gallery.php' method='post'>

		<div id='gallery-preview' class='threepress-button'>
			<img src='<?php echo plugins_url() . "/threepress/assets/eye-viz.png"?>'>
		</div>
		
		<div class='gallery-section'>
			<h4>gallery name</h4>
	    		<input name='gallery_name' type='text' placeholder='<?php  __('gallery name (not displayed publicly)', 'textdomain') ?>'/>
	    	</p>
			<p>
				This will also append an <code>id</code> to the gallery element of form <code>#threepress-gallery-[name]</code>
			<p>
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
	    	<div id='gallery-options'>
	    		<div class='gallery-option'>
	    			
	    			<div class='threepress-options-category'>
		    			<h4>controls</h4>
		    			<div class='selection'>
			    			<label>none</label>
			    			<input name='options-controls' type='radio' value='none'>
			    		</div>
		    			<div class='selection'>
			    			<label>orbit</label>
			    			<input name='options-controls' type='radio' value='orbit'>
			    		</div>
		    			<div class='selection threepress-disabled'>
			    			<label>first person</label>
			    			<input name='options-controls' type='radio' value='first'>
			    		</div>
		    			<div class='selection threepress-disabled'>
			    			<label>flight</label>
			    			<input name='options-controls' type='radio' value='flight'>
			    		</div>
		    		</div>
	    			
		    		<div class='threepress-options-category'>
		    			<h4>light</h4>
		    			<div class='selection threepress-disabled'>
			    			<label>sun</label>
			    			<input name='options-light' type='radio' value='sun'>
			    		</div>
		    			<div class='selection'>
			    			<label>directional</label>
			    			<input name='options-light' type='radio' value='directional'>
			    		</div>
		    			<div class='selection'>
			    			<label>hemispherical</label>
			    			<input name='options-light' type='radio' value='hemispherical'>
			    		</div>
		    		</div>

		    		<div class='threepress-options-category'>
		    			<h4>camera</h4>
		    			<div class='selection'>
			    			<label>user zoom</label>
			    			<input type='checkbox' name='user-zoom'>
			    		</div>
		    			<div class='selection'>
			    			<label>initial zoom</label>
			    			<input type='range' min=1 max=1000 name='camera-dist'>
			    		</div>
		    		</div>

		    		<div class='threepress-options-category threepress-disabled'>
		    			<h4>misc</h4>
		    			<div class='selection'>
			    			<label>rotate scene</label>
			    			<input type='checkbox' name='rotate'>
			    		</div>
		    			<div class='selection'>
			    			<label>rotation speed</label>
			    			<input type='range' min=1 max=1000 name='rotation-speed'>
			    		</div>
		    		</div>

	    		</div>
	    	</div>
	    </div>
		
		<div class='gallery-section'>
	    	<h4>gallery shortcode</h4>
	    	<p>
	    		<textarea id='shortcode' height=50 placeholder='generated shortcode will appear here' readonly/></textarea>
	    		<!-- <input id='shortcode' type='text' placeholder='generated shortcode will appear here' readonly/> -->
	    	</p>
	    </div>

		<p>
			<input type='submit' value='save' id='create-gallery' class='button button-primary'/>
		</p>

	</form>

	<?php

}

?>