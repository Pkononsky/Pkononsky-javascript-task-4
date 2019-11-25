'use strict';

const TYPE_ERROR_TEXT = '"filter" is not a Filter heir';

function getFriendByName(friends, friendName) {
    return friends.find((friend) => friend.name === friendName);
}

function getBestFriendsNames(friends) {
    return friends.filter((friend) => friend.best).map((friend) => friend.name);
}

function getNextFriendToCheck(friends, currentFriends, visitedFriends) {
    let nextFriends = [];
    for (let friend of currentFriends) {
        let friendObj = getFriendByName(friends, friend);
        nextFriends.push(...friendObj.friends.filter((nextFriend) => {
            return !visitedFriends.includes(nextFriend) && !nextFriends.includes(nextFriend);
        }));
    }

    return nextFriends;
}

function getSuitableFriends(friends, filter, maxLevel = Infinity) {
    const bestFriends = getBestFriendsNames(friends);
    let visitedFriends = [...bestFriends];
    let currentFriends = [...bestFriends];
    let suitableFriends = [];
    while (currentFriends.length !== 0 && maxLevel > 0) {
        currentFriends.sort();
        suitableFriends.push(...currentFriends.map((friendName) => {
            return getFriendByName(friends, friendName);
        }));
        currentFriends = getNextFriendToCheck(friends, currentFriends, visitedFriends);
        visitedFriends.push(...currentFriends);
        maxLevel--;
    }

    return suitableFriends.filter(filter.isSuitable);
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
    this.suitableFriends = getSuitableFriends(friends, filter);
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
    this.suitableFriends = getSuitableFriends(friends, filter, maxLevel);
    this.isDone = this.suitableFriends.length === 0;
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {

}

Filter.prototype.isSuitable = function () {
    return true;
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {

}

MaleFilter.prototype.isSuitable = function (friend) {
    return friend.gender === 'male';
};

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {

}

FemaleFilter.prototype.isSuitable = function (friend) {
    return friend.gender === 'female';
};


Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);
Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
