const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    port: 8099,
  },
  resolver: {
    // Watchman is disabled deliberately. This laptop runs many RN projects and
    // fs.inotify.max_user_watches (65536) is too low for them, so the watchman
    // server poisons itself ("The user limit on the total number of inotify
    // watches was reached") and every client then hangs — a release bundle sat
    // at 0.1 % CPU for 10 minutes before this was tracked down. Metro's own node
    // crawler is slower to start but cannot deadlock this way. Raising the
    // sysctl to 524288 is the system-level fix; this keeps the build green
    // either way.
    useWatchman: false,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
