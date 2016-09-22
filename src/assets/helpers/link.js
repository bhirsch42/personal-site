module.exports.register = Handlebars => {
  Handlebars.registerHelper('url', file => {
    return `/${file.relative.split('.')[0]}/`;
  });
}