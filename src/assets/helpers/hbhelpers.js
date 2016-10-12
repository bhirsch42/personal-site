function convertImage(root, filename, suffix, conversion) {
  image = root.image[filename];
  image.gm = image.gm || {};
  conversion.filename = filename;
  filename = filename.split('.')
  newFilename = `${filename[0]},${suffix}.${filename[1]}`
  conversion.newFilename = newFilename;
  image.gm[newFilename] = conversion;
  return newFilename;
}

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

  Handlebars.registerHelper('img_resize', (filename, width, height, root, options) => {
    newFilename = convertImage(root, filename, `${width}w,${height}h`, {
      'conversion': 'resize',
      'params': {
        'width': width,
        'height': height}
      });

    return newFilename;
  });

  Handlebars.registerHelper('img_width', (filename, root, options) => {
    return root.image[filename].width
  });

  Handlebars.registerHelper('img_height', (filename, root, options) => {
    return root.image[filename].height
  });

  Handlebars.registerHelper('img_res_style_narrow_outer', (filename, root, options) => {
    return ""
  });

  Handlebars.registerHelper('img_res_style_narrow_inner', (filename, root, options) => {
    return ""
  });
}
