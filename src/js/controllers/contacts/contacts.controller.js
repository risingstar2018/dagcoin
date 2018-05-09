(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('ContactsController', ContactsController);

  ContactsController.$inject = ['addressbookService', '$timeout', '$rootScope', '$scope', 'lodash'];

  function ContactsController(addressbookService, $timeout, $rootScope, $scope, lodash) {
    const contacts = this;

    contacts.showSearchBox = false;

    function viewContentLoaded() {
      contacts.activeTabIndex = 0;
      loadList();
    }

    contacts.toggleFavorite = (contact) => {
      contact.favorite = !contact.favorite;
      addressbookService.update(contact, (error) => {
        if (error) {
          $rootScope.$emit('Local/ShowAlert', error, 'fi-alert', () => { });
          return;
        }
        loadList(contacts.search);
      });
    };

    contacts.swiper = {};
    contacts.search = '';

    contacts.onReadySwiper = (swiper) => {
      contacts.swiper = swiper;

      swiper.on('slideChangeStart', () => {
        $timeout(() => {
          contacts.activeTabIndex = swiper.activeIndex;
          contacts.search = '';
          loadList();
        }, 0);
      });
    };

    contacts.activeTab = index => contacts.activeTabIndex === index;

    function loadList(filterValue) {
      contacts.list = {};
      contacts.listTotal = 0;
      contacts.favoriteList = {};
      contacts.favoriteListTotal = 0;

      // TODO these methods should be moved to service side
      addressbookService.list((list) => {
        function hashSort(src) {
          const keys = Object.keys(src);
          const target = {};
          keys.sort();
          keys.forEach((key) => {
            target[key] = src[key];
          });
          return target;
        }

        function compareFn(propertyProjection) {
          return (a, b) => {
            const nameA = propertyProjection(a);
            const nameB = propertyProjection(b);
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          };
        }

        function getListTotal(contactList) {
          return lodash.size(contactList);
        }

        function getFavoriteListTotal(contactList) {
          let result = 0;
          Object.keys(contactList).map((address) => {
            const contact = contactList[address];
            result += contact.favorite ? 1 : 0;
            return true;
          });
          return result;
        }

        Object.keys(list).map((address) => {
          const contact = list[address];
          const firstLetter = contact.first_name.charAt(0).toUpperCase();
          const firstNameCondition = filterValue && contact.first_name.toUpperCase().indexOf(filterValue.toUpperCase()) !== -1;
          const lastNameCondition = filterValue && lodash.has(contact, 'last_name') && contact.last_name.toUpperCase().indexOf(filterValue.toUpperCase()) !== -1;

          if (contacts.activeTabIndex === 0) {
            if (!contacts.list[firstLetter] && firstLetter) {
              contacts.list[firstLetter] = [];
            }

            if (!filterValue || firstNameCondition || lastNameCondition) {
              contacts.list[firstLetter].push(contact);
            }

            if (contacts.list[firstLetter].length <= 0) {
              contacts.list = lodash.omit(contacts.list, firstLetter);
            }
            contacts.listTotal = lodash.size(contacts.list);
          } else if (contacts.activeTabIndex === 1) {
            if (contact.favorite && (!filterValue || firstNameCondition || lastNameCondition)) {
              if (!contacts.favoriteList[firstLetter]) {
                contacts.favoriteList[firstLetter] = [];
              }
              contacts.favoriteList[firstLetter].push(contact);
            }
            contacts.favoriteListTotal = lodash.size(contacts.favoriteList);
          }

          return true;
        });

        Object.keys(contacts.list).map((letter) => {
          contacts.list[letter] = contacts.list[letter].sort(compareFn(item => item.first_name.toUpperCase()));
          return true;
        });

        contacts.list = hashSort(contacts.list);
        contacts.favoriteList = hashSort(contacts.favoriteList);

        // When the filter value is null it is able to get existing totals in db
        if (lodash.isEmpty(filterValue)) {
          contacts.existsAnyContact = getListTotal(list) > 0;
          contacts.existsAnyFavContact = getFavoriteListTotal(list) > 0;
        }

        // This determines whether search box is visible or hidden
        if (contacts.activeTabIndex === 0) {
          contacts.showSearchBox = contacts.existsAnyContact;
        } else if (contacts.activeTabIndex === 1) {
          contacts.showSearchBox = contacts.existsAnyFavContact;
        }

        // todo why this setting? If in favorite, contacts tab is active???
        // if (contacts.listTotal <= 0) {
        //  contacts.activeTabIndex = 0;
        // }
      });
    }

    $scope.$watch('contacts.search', (value) => {
      loadList(value);
    });

    $scope.$on('$viewContentLoaded', viewContentLoaded);
  }
})();
