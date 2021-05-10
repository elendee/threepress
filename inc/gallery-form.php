<?php

function threepress_gallery_form(){

	?>

	<form id='gallery-form' action='create-gallery.php' method='post'>

		<div id='gallery-preview' class='threepress-button' title='gallery preview'>
			<img src='<?php echo plugins_url() . "/threepress/assets/eye-viz.png"?>'>
		</div>
		
		<div class='gallery-section'>
			<h4>gallery name</h4>
	    		<input name='gallery_name' type='text' placeholder='<?php  __('gallery name (not displayed publicly)', 'textdomain') ?>'/>
	    	</p>
			<p>
				<div class='clarification'>This will also append an <code>id</code> to the gallery element of form <code>#threepress-gallery-[name]</code></div>
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
		    			<h4>background</h4>
		    			<div class='selection'>
		    				<input type='color' name='bg_color_selector'>
			    		</div>
		    			<div class='selection'>
		    				<label>use picker <b>or</b> any valid CSS color:</label>
		    				<input name='bg_color' type='text' value='linear-gradient( 45deg, white, transparent )'>
		    			</div>
		    		</div>
	    			
	    			<div class='threepress-options-category'>
		    			<h4>controls</h4>
		    			<div class='selection'>
			    			<label>none</label>
			    			<input name='options_controls' type='radio' value='none'>
			    		</div>
		    			<div class='selection'>
			    			<label>orbit</label>
			    			<input name='options_controls' type='radio' value='orbit' checked='true'>
			    		</div>
		    			<div class='selection threepress-disabled'>
			    			<label>first person</label>
			    			<input name='options_controls' type='radio' value='first'>
			    		</div>
		    			<div class='selection threepress-disabled'>
			    			<label>flight</label>
			    			<input name='options_controls' type='radio' value='flight'>
			    		</div>
		    		</div>
	    			
		    		<div class='threepress-options-category'>
		    			<h4>light</h4>
		    			<div class='selection threepress-disabled'>
			    			<label>sun</label>
			    			<input name='options_light' type='radio' value='sun'>
			    		</div>
		    			<div class='selection'>
			    			<label>directional</label>
			    			<input name='options_light' type='radio' value='directional' checked="true">
			    		</div>
		    			<div class='selection threepress-disabled'>
			    			<label>hemispherical</label>
			    			<input name='options_light' type='radio' value='hemispherical'>
			    		</div>
			    		<div class='selection'>
			    			<label>intensity</label>
			    			<input type='range' min=1 max=10 name='intensity' value=5 />
			    		</div>
		    		</div>

		    		<div class='threepress-options-category'>
		    			<h4>camera</h4>
		    			<div class='selection'>
		    				<label>allow zoom</label>
		    				<input type='checkbox' name='allow_zoom' checked="true">
			    		</div>
			    		<div class='selection contingent'>
			    			<label>zoom speed</label>
			    			<input type='range' min=1 max=12 name='zoom_speed'>
			    		</div>
			    		<div class='selection'>
							<label>initial zoom</label>
			    			<input type='range' min=1 max=20 name='camera_dist'>
			    		</div>
		    		</div>

		    		<div class='threepress-options-category'>
		    			<h4>rotation</h4>
		    			<div class='selection'>
			    			<label>auto rotate scene</label>
			    			<input type='checkbox' name='rotate_scene' checked="true">
			    		</div>
		    			<div class='selection contingent'>
			    			<label>rotation speed</label>
			    			<input type='range' min=1 max=100 name='rotate_speed' value='20'>
			    		</div>
		    			<div class='selection contingent'>
			    			<label>x axis</label>
			    			<input type='checkbox' name='rotate_x'>
			    		</div>
		    			<div class='selection contingent'>
			    			<label>y axis</label>
			    			<input type='checkbox' name='rotate_y' checked="true">
			    		</div>
		    			<div class='selection contingent'>
			    			<label>z axis</label>
			    			<input type='checkbox' name='rotate_z'>
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
			<input value='close' id='close-gallery' class='button button-primary'/>
		</p>
    	<div class='clarification'>you do not have to save a shortcode to use it - saving is just for reference</div>


	</form>

	<?php

}

?>