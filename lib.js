'use strict';

const TYPE_ERROR_TEXT = '"filter" is not a Filter heir';

function getFriendObjectByName(friends, friendName) {
    return friends.find((friend) => {
        return friend.name === friendName;
    });
}

function getBestFriends(friends) {
    return friends.filter((friend) => {
        return friend.best;
    }).map((friend) => {
        return friend.name;
    });
}

function getNextFriendToCheck(friends, friendsToCheck, visitedFriends) {
    let nextFriends = [];
    for (let friend of friendsToCheck) {
        let friendObj = getFriendObjectByName(friends, friend);
        nextFriends.push(...friendObj.friends.filter((nextFriend) => {
            return !visitedFriends.includes(nextFriend);
        }));
    }

    return nextFriends;
}

function* bypassFriendsGraph(friends, filter, maxLevel = -1) {
    const bestFriends = getBestFriends(friends);

    let visitedFriends = [...bestFriends];
    let friendsToCheck = [...bestFriends];
    let currentLevel = 0;
    while (friendsToCheck.length !== 0 && currentLevel !== maxLevel) {
        currentLevel++;
        let suitableFriendsName = friendsToCheck.filter((friend) => {
            let friendObj = getFriendObjectByName(friends, friend);

            return filter.isSuitable(friendObj);
        }).sort();
        let suitableFriends = suitableFriendsName.map((friendName) => {
            return getFriendObjectByName(friends, friendName);
        });
        while (suitableFriends.length !== 0) {
            yield suitableFriends.shift();
        }
        friendsToCheck = getNextFriendToCheck(friends, friendsToCheck, visitedFriends);
        visitedFriends.push(...friendsToCheck);
    }
}


/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError(TYPE_ERROR_TEXT);
    }
    this.bypassGenerator = bypassFriendsGraph(friends, filter);
    this.generatorWorkResult = this.bypassGenerator.next();
}

Iterator.prototype = {
    next: function () {
        let nextFriend = this.generatorWorkResult.value;
        nextFriend = nextFriend === undefined ? null : this.generatorWorkResult.value;
        this.generatorWorkResult = this.bypassGenerator.next();

        return nextFriend;
    },
    done: function () {
        return this.generatorWorkResult.done;
    }
};

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    if (!(filter instanceof Filter)) {
        throw new TypeError(TYPE_ERROR_TEXT);
    }
    this.bypassGenerator = bypassFriendsGraph(friends, filter, maxLevel);
    this.generatorWorkResult = this.bypassGenerator.next();
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isSuitable = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isSuitable = function (friend) {
        return friend.gender === 'male';
    };
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.isSuitable = function (friend) {
        return friend.gender === 'female';
    };
}

LimitedIterator.prototype = Iterator.prototype;
MaleFilter.prototype = Filter.prototype;
FemaleFilter.prototype = Filter.prototype;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
