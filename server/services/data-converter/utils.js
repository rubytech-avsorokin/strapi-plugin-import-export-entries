const convertEntryToStrArray = (entry, keys) => {
  return keys.map((key) => entry[key]);
};

const convertStrArrayToCsv = (entry) => {
  return entry
    .map(String)
    .map((v) => v.replace(/"/g, '""'))
    .map((v) => `"${v}"`)
    .join(",");
};

const convertToCsv = (entries, options) => {
  const columnTitles = getAttributeNames(options.slug);
  const content = [convertStrArrayToCsv(columnTitles)]
    .concat(
      entries
        .map((entry) => convertEntryToStrArray(entry, columnTitles))
        .map(convertStrArrayToCsv)
    )
    .join("\r\n");
  return content;
};

const convertToJson = (entries, options) => {
  entries = JSON.stringify(entries, null, "\t");
  return entries;
};

const withBeforeConvert = (convertFn) => (entries, options) => {
  entries = beforeConvert(entries, options);
  entries = convertFn(entries, options);
  return entries;
};

const beforeConvert = (entries, options) => {
  if (options.relationsAsId) {
    const relationKeys = getAttributeNames(options.slug, "relation");
    entries = entries.map((entry) => {
      relationKeys.forEach((key) => {
        if (entry[key]) {
          entry[key] = entry[key].id;
        }
      });
      return entry;
    });
  }
  return entries;
};

const getAttributeNames = (slug, filterType) => {
  const attributes = strapi.db.metadata.get(slug).attributes;
  const names = Object.keys(attributes);

  if (filterType) {
    return names.filter((key) => attributes[key].type === filterType);
  }

  return names;
};

module.exports = {
  convertToCsv: withBeforeConvert(convertToCsv),
  convertToJson: withBeforeConvert(convertToJson),
};