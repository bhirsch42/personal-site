$('.pswp-image').click((e) => {
  var $image = $(e.target);
  console.log($image);
  var images = $image.parent().find('img');
  console.log(images);
  var pswpElement = document.querySelectorAll('.pswp')[0];
  var items = [
    {
      src: 'https://placekitten.com/600/400',
      w: 600,
      h: 400
    },
    {
      src: 'https://placekitten.com/1200/900',
      w: 1200,
      h: 900
    }
  ];
  var options = {
    index: 0 // start at first slide
  };
  // var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
  // gallery.init();
  console.log("hello gallery");
})

