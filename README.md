# blueflood_grafana_plugin_1.9.x

Download latest 1.x.x release and unpack into <your grafana installation>/plugins/datasource/.
Then edit Grafana config.js

###Add dependencies###

plugins: {
  panels: [],
  dependencies: ['datasource/blueflood/datasource'],
}

###Add datasource and setup your Zabbix API url, username and password###

datasources: {
  ...
  blueflood: {
    type: 'BluefloodDatasource',
    url: 'http://staging.metrics.api.rackspacecloud.com'
  }
  },
