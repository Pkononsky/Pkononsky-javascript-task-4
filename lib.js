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
            return !visitedFriends.includes(nextFriend) && !nextFriends.includes(nextFriend);
        }));
    }

    return nextFriends;
}

function bypassFriendsGraph(friends, filter, maxLevel = -1) {
    const bestFriends = getBestFriends(friends);
    let visitedFriends = [...bestFriends];
    let friendsToCheck = [...bestFriends];
    let suitableFriends = [];
    let currentLevel = 0;
    while (friendsToCheck.length !== 0 && currentLevel !== maxLevel) {
        currentLevel++;
        let suitableFriendsName = friendsToCheck.filter((friendName) => {
            let friendObj = getFriendObjectByName(friends, friendName);

            return filter.isSuitable(friendObj);
        }).sort();
        suitableFriends.push(...suitableFriendsName.map((friendName) => {
            return getFriendObjectByName(friends, friendName);
        }));
        friendsToCheck = getNextFriendToCheck(friends, friendsToCheck, visitedFriends);
        visitedFriends.push(...friendsToCheck);
    }

    return suitableFriends;
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
    this.suitableFriends = bypassFriendsGraph(friends, filter);
    this.isDone = this.suitableFriends.length === 0;
}

Iterator.prototype = {
    next: function () {
        let friend = this.suitableFriends.shift();
        friend = friend === undefined ? null : friend;
        this.isDone = this.suitableFriends.length === 0;

        return friend;
    },
    done: function () {
        return this.isDone;
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
    this.suitableFriends = bypassFriendsGraph(friends, filter, maxLevel);
    this.isDone = this.suitableFriends.length === 0;
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

Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);
Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
