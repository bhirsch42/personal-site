$('.pswp-image').click((e) => {
  console.log('photoswipe click');
  var $image = $(e.target);
  var images = $image.parent().find('img');
  var pswpElement = document.querySelectorAll('.pswp')[0];
  var items = images.map((index, image) => {
    image = $(image);
    var d = {src: image.data('pswp-src'), w: image.data('width'), h: image.data('height')}
    return d
  })
  var options = {
    index: 0, // start at first slide
    bgOpacity: 1,
    getThumbBoundsFn: (index) => {
      let $image = $(images[index]);
      return {
        x: $image.position().left,
        y: $image.position().top,
        w: $image.width()
      };
    }
  };
  var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
  gallery.init();
})

console.log("photoswipe ready!");