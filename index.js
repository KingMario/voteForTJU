var urllib = require('urllib')
var md5 = require('md5')

let vote = () => urllib.request('http://www.xicidaili.com/nn/', (err, data, res) => {
  if (err) {
    throw err
  }

  var proxies = data.toString().match(/<td>\d+\.\d+\.\d+\.\d+<\/td>\n\s+<td>\d+<\/td>/g)

  proxies.forEach((proxy) => {
    proxy = proxy.replace(/[\s\n]/g, '')
      .replace(/<\/td><td>/, ':')
      .replace(/<\/*td>/g, '')

    var [host, port] = proxy.split(':')

    urllib.request('http://pv.sohu.com/cityjson?ie=utf-8', {
      dataType: 'text',
      enableProxy: true,
      proxy: `http://${proxy}`
    }, (err, data, res) => {
      if (data && data.indexOf(host) > -1) {
        var path = `http://tongji.gambition.cn/tongji-vote/teacher/${process.env.t_id}/vote/${md5(host)}`
        var referer = `http://tongji.gambition.cn/detail/${process.env.t_id}`
        urllib.request(path, {
          dataType: 'json',
          headers: {
            Referer: referer
          },
          enableProxy: true,
          proxy: `http://${proxy}`
        }, (err, data, res) => {
          if (err) {
            return
          }

          if (data && data.hasOwnProperty('has_vote') && !data.has_vote) {
            urllib.request(path, {
              method: 'POST',
              dataType: 'json',
              headers: {
                Referer: referer
              },
              enableProxy: true,
              proxy: `http://${proxy}`
            }, (err, data, res) => {
              err ? console.log(err) : console.log(data)
            })
          }
        })
      }
    })
  })
})

setInterval(vote, 60000)
vote()
