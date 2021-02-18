

exports.allArrayIsEqual = (a, b) => {
    if (a instanceof Array && b instanceof Array) {
        var differentIds = 0
        for (let i = 0; i < a.length; i++) {
            var m = b.find(x => {
                if (x == a[i]) {
                    return true;
                } else {
                    return false;
                }
            })
            if (!m) {
                differentIds += 1;
            }
        }

        return differentIds;
    } else {
        return -1;
    }
}