(function($, Story) {

  Story.chaptersUpdate = {
    0: function() {
      HallsMap.flyTo([52.505, -1], 6);
    },
    1: function() {
      HallsMap.flyToCompany("UPP", 11);
      HallsMap.toggleAllButCompany("UPP", false);
      HallsMap.showCompanyLinks("UPP");
    },
    2: function() {
      HallsMap.hideAllLinks();
      var unite = HallsMap.getCompanyAndIcons("Unite Students");
      var chapterLiving = HallsMap.getCompanyAndIcons("Chapter Living");
      var crm = HallsMap.getCompanyAndIcons("CRM Students");
      // var vero = HallsMap.getCompanyAndIcons("Vero Group");
      // console.log(vero);
      var array = _.concat([], unite, chapterLiving, crm);
      HallsMap.toggleAllBut(array, false);
      HallsMap.showCompanyLinks("Unite Students");
      HallsMap.showCompanyLinks("Chapter Living");
      HallsMap.showCompanyLinks("CRM Students");
      HallsMap.fitAllIconsZoom(array, 7);
    },
    3: function() {
      HallsMap.toggleUniversityIcons("public", false);
      HallsMap.flyTo([51.505, -0.11], 11);
      HallsMap.showAllCompanyLinks();
    },
    4: function() {
      HallsMap.flyTo([51.505, -0.11], 11);
      HallsMap.toggleAllUniMarkers(false);
      HallsMap.toggleAllCompanyMarkers(false);
    },
    5: function() {
      // console.log("hello1");
    }
  };

  // methods to revert
  Story.chaptersRevert = {
    0: function() {
      HallsMap.hideAllLinks();
    },
    1: function() {
      HallsMap.showCompanyLinks("UPP");
      HallsMap.toggleAllButCompany("UPP", true);
      HallsMap.showAllLinksFunc();
    },
    2: function() {
      var unite = HallsMap.getCompanyAndIcons("Unite Students");
      var chapterLiving = HallsMap.getCompanyAndIcons("Chapter Living");
      var crm = HallsMap.getCompanyAndIcons("CRM Students");
      var array = _.concat([], unite, chapterLiving, crm);
      HallsMap.toggleAllBut(array, true);
      HallsMap.showCompanyLinks("Unite Students");
      HallsMap.showCompanyLinks("Chapter Living");
      HallsMap.showCompanyLinks("CRM Students");
      // HallsMap.showAllLinksFunc();
    },
    3: function() {
      HallsMap.toggleUniversityIcons("public", true);
      HallsMap.showAllCompanyLinks();
    },
    4: function() {
      HallsMap.toggleAllUniMarkers(true);
      HallsMap.toggleAllCompanyMarkers(true);
    },
    5: function() {
      // console.log("hello1");
    }
  };

  var numberOfChapters = 6;

  var currentChapter = 0;

  Story.nextChapter = function () {
    if (currentChapter < numberOfChapters - 1) {
      hideRightChapter(currentChapter);
      showRightChapter(currentChapter + 1, true);
      Story.chaptersRevert[currentChapter]();
      currentChapter += 1;
      Story.chaptersUpdate[currentChapter]();
      console.log("Current Chapter: " + currentChapter);
      $(".right-arrow").fadeIn();
      $(".left-arrow").show();
    }
    if (currentChapter === numberOfChapters - 1) {
      $(".right-arrow").fadeOut();
    }
  };

  Story.previousChapter = function() {
    if (currentChapter === 1) {
      $(".left-arrow").fadeOut();
    }
    if (currentChapter != 0) {
      hideLeftChapter(currentChapter);
      showLeftChapter(currentChapter - 1, true);
      Story.chaptersRevert[currentChapter]();
      currentChapter -= 1;
      Story.chaptersUpdate[currentChapter]();
      console.log("Current Chapter: " + currentChapter);
      $(".right-arrow").fadeIn();
    }
  };

  function hideLeftChapter(id) {
    var chapter = $("#ch" + id);
    chapter.animate({
        left: chapter.width() * 1.1
    }, 500);
    chapter.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
      chapter.hide();
      chapter.unbind();
    });
  }

  function hideRightChapter(id) {
    var chapter = $("#ch" + id);
    chapter.css({
      left: -(chapter.width() * 1.1)
    });
    chapter.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
      chapter.hide();
      chapter.unbind();
    });
  }

  function showLeftChapter(id, animate_boolean) {
    var chapter = $("#ch" + id);

    if (animate_boolean) {
      chapter.show().css({
        left: -(chapter.width())
      }).animate({
        left: 0
      }, 500);
    } else {
      chapter.show();
    }
  }

  function showRightChapter(id, animate_boolean) {
    var chapter = $("#ch" + id);

    if (animate_boolean) {
      chapter.css({
        left: (chapter.width())
      });
      chapter.show().css({
        left: 0
      });
    } else {
      chapter.show().css({
        left: 0
      });
    }
  }

  Story.init = function () {
    console.log("Current Chapter: " + currentChapter);
    showRightChapter(0, false);
    $(".left-arrow").hide();
    Story.chaptersUpdate[currentChapter]();

    for (var i = 1; i < numberOfChapters; i+= 1) {
      $("#ch" + i).show();
      $("#ch" + i).hide();
    }

    $('.right-arrow').click(function() {
      Story.nextChapter();
    });
    $('.left-arrow').click(function() {
      Story.previousChapter();
    });
  };

})($, window.Story = window.Story || {});
