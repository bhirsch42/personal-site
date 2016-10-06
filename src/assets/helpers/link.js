module.exports.register = Handlebars => {
  Handlebars.registerHelper('url', file => {
    return `/${file.relative.split('.')[0]}/`;
  });

  Handlebars.registerHelper('if_in', (arr, s, options) => {
    if (arr && s && options && arr.indexOf(s) >= 0) {
      return options.fn(this);
    }
  });

  Handlebars.registerHelper('if_eq', (a, b, options) => {
    if (a && b && options && a == b) {
      return options.fn();
    }
  });

  Handlebars.registerHelper('img_width', (filename, root, options) => {
    return root.image[filename].width
  });

  Handlebars.registerHelper('img_height', (filename, root, options) => {
    return root.image[filename].height
  });
}
