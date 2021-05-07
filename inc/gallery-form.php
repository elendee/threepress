
<form id='gallery-form' action='create-gallery.php' method='post'>

	<div id='gallery-preview' class='threepress-button'>
		preview
	</div>
	
	<div class='gallery-section'>
		<h4>gallery name</h4>
    		<input name='gallery_name' type='text' placeholder='<?php echo __('gallery name (not displayed publicly)', 'textdomain'); ?>'/>
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
    		<textarea id='shortcode' height=50 placeholder='generated shortcode will appear here' readonly/></textarea>
    		<!-- <input id='shortcode' type='text' placeholder='generated shortcode will appear here' readonly/> -->
    	</p>
    </div>

	<p>
		<input type='submit' value='save' id='create-gallery' class='button button-primary'/>
	</p>

</form>