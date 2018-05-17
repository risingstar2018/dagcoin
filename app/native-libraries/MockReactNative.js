// Replaces DeviceEventEmitter with a timer periodically emitting an incrementing x and y value.
class DeviceEventEmitter {
    static addListener(id, callback) {
        setInterval(() => {
            if (!this.t) {
                this.t = 0;
            }
            this.t += 0.001;

            let rotationRate = {
                x: this.t,
                y: this.t
            };

            callback({
                rotationRate: rotationRate
            });
        }, 100);
    }
}

module.exports = {
    DeviceEventEmitter,
    ...require('react-native-web')  // Plus everything implemented in react-native-web
};
