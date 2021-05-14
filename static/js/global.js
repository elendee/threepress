// receives THREEPRESS{}


document.addEventListener('DOMContentLoaded', () => {


const admin_entry = document.querySelector('#toplevel_page_threepress-inc-admin')

if( admin_entry ){
	admin_entry.querySelector('.wp-menu-image').remove()
	const icon = document.createElement('span')
	icon.innerHTML = '<img src="' + THREEPRESS.plugin_url + '/assets/icon-menu.png">'
	admin_entry.querySelector('.wp-menu-name').prepend( icon )
}


})
