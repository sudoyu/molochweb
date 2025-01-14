'use strict';

function parseXML (xml) {
  let files = $(xml).find('ListBucketResult').find('Contents');
  let downloads = {};
  let nightlies = { title:'Nightly', downloads:[] };
  let commities = { title:'Last Commit', downloads:[] };

  for (let i = 0, len = files.length; i < len; ++i) {
    let file = $(files[i]);
    let key  = file.find('Key').text();

    if (key.startsWith('builds/')) {
      let keyArr = key.split('/');
      let os     = keyArr[1];
      let vers   = keyArr[2];
      let time   = new Date(file.find('LastModified').text());

      time = `${time.getFullYear()}-${('0'+(time.getMonth()+1)).slice(-2)}-${('0'+time.getDate()).slice(-2)}`;

      let uniqueVers = vers.match(/([0-9]+)\.([0-9]+)\.([0-9]+)/g);

      let osTitle = os.replace('-', ' ');
      osTitle = osTitle.charAt(0).toUpperCase() + osTitle.slice(1);

      let download = {
        url  : `https://files.molo.ch/${key}`,
        title: osTitle
      };

      if (!uniqueVers && vers.includes('nightly')) {
        if (!nightlies.time) { nightlies.modified = time; }
        nightlies.downloads.push(download);
        continue;
      }

      uniqueVers = uniqueVers[0];

      // group by version
      if (!downloads.hasOwnProperty(uniqueVers)) {
        downloads[uniqueVers] = {
          title     : `Moloch ${uniqueVers}`,
          downloads : [download],
          modified  : time
        };
      } else {
        downloads[uniqueVers].downloads.push(download);
      }
    } else if (key.startsWith('moloch-master')) {
      let keyArr = key.split(key[13]);
      let os = keyArr[1];
      let time   = new Date(file.find('LastModified').text());
      time = `${time.getFullYear()}-${('0'+(time.getMonth()+1)).slice(-2)}-${('0'+time.getDate()).slice(-2)} ${('0'+time.getHours()).slice(-2)}:${('0'+time.getMinutes()).slice(-2)}:${('0'+time.getSeconds()).slice(-2)}`;

      let osTitle = {centos6: 'Centos 6', centos7: 'Centos 7', ubuntu14: 'Ubuntu 14.04', ubuntu16: 'Ubuntu 16.04', ubuntu18: 'Ubuntu 18.04'}[os];

      let download = {
        url  : `https://files.molo.ch/${key}`,
        title: osTitle
      };
      commities.modified = time;
      commities.downloads.push(download);
    }
  }

  return {
    downloads: downloads,
    nightlies: nightlies,
    commities: commities,
    sortedVersions: Object.keys(downloads).reverse()
  };
}
