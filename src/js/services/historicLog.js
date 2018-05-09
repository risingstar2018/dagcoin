(function () {
  'use strict';

  const logs = [];
  angular.module('copayApp.services')
  .factory('historicLog', (lodash) => {
    const formatDate = date => date.toISOString().split('T').join(' ').replace('Z', '');
    const logLevels = {
      error: {
        value: 40
      },
      warn: {
        value: 30
      },
      info: {
        value: 20
      },
      debug: {
        value: 10
      }
    };
    const root = {};

    root.getLevelValue = (level) => {
      if (logLevels[level]) {
        return logLevels[level].value;
      }
      return 0;
    };

    root.add = (level, msg, dateTime) => logs.push({ level, msg, dateTime });

    root.get = (level) => {
      const thresholdLevel = logLevels[level];
      if (lodash.isEmpty(thresholdLevel)) {
        return logs;
      }
      const thresholdLevelValue = thresholdLevel.value;
      const result = lodash.filter(logs, (log) => {
        if (root.getLevelValue(log.level) >= thresholdLevelValue) {
          return log;
        }
      });
      return result;
    };

    /**
     *
     * @param level
     * @return {string} concatenated logs separated by newline
     */
    root.writeLogsToString = (level) => {
      let result = '';
      lodash.map(root.get(level), (log) => {
        const date = log.dateTime ? formatDate(log.dateTime) : '0000-00-00 00:00:00.000';
        result += `[${date}] [${log.level}] ${log.msg}\n`;
      });
      return result;
    };

    return root;
  });
}());
