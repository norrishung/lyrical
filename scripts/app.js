//Global App Object
window.Lyrical  = {
    Models: {},
    Collections: {},
    Views: {},
    Routers : {},
    init: function () {
        var songList = new Lyrical.Views.SongList();
        var empty = new Lyrical.Views.Empty();
    },

    resetSongContainer: function() {
        $('.song-container').empty();
        $('.song-container, .button-show-nav, .button-confirm-song, .button-add-song, .button-delete-song, .button-edit-song').off();
    }
};

//Load app when ready
$(document).ready(function() {
    Lyrical.init();
});


//Song Model
Lyrical.Models.Song = Backbone.Model.extend({
    defaults: {
        title: "Title",
        artist: "Artist",
        tuning: "Tuning",
        lyrics: "Lyrics"
    }
})

//Empty Song View
Lyrical.Views.Empty = Backbone.View.extend({
    el: $('.song-container'),
    events: {
        'click .button-show-nav': 'openNav',
    },

    initialize: function() {
        this.render()
    },

    openNav: function() {
        $('body').addClass('nav-open');
    },

    closeNav: function() {
        $('body').removeClass('nav-open');
    },

    render: function() {
        Lyrical.resetSongContainer();
        var songTemplate = $('#template-empty').html();
        this.$el.empty();
        this.$el.append(Mustache.render(songTemplate));
    }
})

//Song View
Lyrical.Views.Song = Backbone.View.extend({
    el: $('.song-container'),
    events: {
        'click .button-show-nav': 'openNav',
        'click .button-delete-song': 'deleteSong',
        'click .button-edit-song': 'goToEditSongView'
    },

    initialize: function() {
        this.listenTo(this.model, 'destroy', this.removeSong);
        this.render()
    },

    deleteSong: function() {
        //Need to destroy model, this isn't working
        this.model.destroy();
        var empty = new Lyrical.Views.Empty();
    },

    removeSong: function() {
        this.$el.empty();
        this.undelegateEvents();
    },

    goToEditSongView: function() {
        var editSongView = new Lyrical.Views.EditSong({model: this.model});
    },

    openNav: function() {
        $('body').addClass('nav-open');
    },

    closeNav: function() {
        $('body').removeClass('nav-open');
    },

    render: function() {
        Lyrical.resetSongContainer();
        var songTemplate = $('#template-song').html();
        this.$el.append(Mustache.render(songTemplate, this.model.toJSON()));
        $('.lyrics', this.el).append(this.model.get('lyrics'));
    }
})

//Songlist Collection
Lyrical.Collections.SongList = Backbone.Collection.extend({
    model: Lyrical.Models.Song,
    localStorage: new Backbone.LocalStorage("SongList")
})

//Songlist View
Lyrical.Views.SongList = Backbone.View.extend({
    el: $('.song-list'),
    events: {
        'click .button-add-song': 'showSongDialogue'
    },
    initialize: function() {
        this.collection = new Lyrical.Collections.SongList();
        this.collection.bind('add', this.appendSong);
        this.render();
        this.collection.fetch();


        // var dummySong = new Lyrical.Models.Song({
        //     title: "Where Can I Go?",
        //     artist: "Laura Marling",
        //     tuning: "DGDGAD",
        //     lyrics: "<p>I was a daddy&apos;s girl sometime</p><p>But I loved my mama til the end of the line</p><p>I am cold and I am bright</p><p>It&apos;s a curse of mine to be sad at night</p><p>It&apos;s a curse of mine to be sad at night</p><br/><p>Late at night he&apos;ll come to me and he&apos;ll tell me I&apos;m alone</p><p>Don&apos;t you think I don&apos;t already know?</p><p>All I see is road</p><p>No one takes me home</p><p>Where, where can I go?</p><br/><p>Truth about desire they say</p><p>Is a need to breathe for another day</p><p>Truth I heard about regret</p><p>It&apos;s the hardest truth I&apos;ve come to yet</p><p>It&apos;s the hardest truth I&apos;ve come to yet</p><br/><p>Late at night he&apos;ll come to me and he&apos;ll tell me I&apos;m alone</p><p>Don&apos;t you think I don&apos;t already know?</p><p>All I hear are woes</p><p>There&apos;s something I don&apos;t know</p><p>Where, where can I?</p><br/><p>All I see is road</p><p>No one takes me home</p><p>Where, where can I?</p><br/><p>If I feel like I want to be alone</p><p>If I feel like I&apos;m better fought than won</p><br/><p>Pick up your rope and jump for Rosie</p><p>She&apos;s just a sweet thing with her curls</p><p>Just about a woman with her clothes on</p><p>You take &apos;em off and she&apos;s a girl</p><p>All I hear are woes</p><p>There&apos;s something I don&apos;t know</p><p>Where, where can I?</p>"
        // });
        // this.collection.push(dummySong);
    },

    showSongDialogue: function() {
        $('.dialogue-add-song').remove();
        var addSongView = new Lyrical.Views.AddSong({
            collection: this.collection
        });
    },

    appendSong: function(song) {
        var songListItem = new Lyrical.Views.SongListItem({model: song});
    },

    render: function() {
        console.log('rendering songlist');
        var songListTemplate = $('#template-song-list').html();
        $(this.el).append(Mustache.render(songListTemplate));
        _.each(this.collection, function(song) {
             this.appendSong(song)
        });
    }
});

//Song List Item View
Lyrical.Views.SongListItem = Backbone.View.extend({
    tagName: 'li',
    events: {
        'click .song-link': 'showSong'
    },
    initialize: function() {
        this.render();
        this.listenTo(this.model, 'destroy', this.removeSongFromList)
    },
    render: function() {
        var songListItemTemplate = $('#template-song-list-item').html();
        var song = this.model.toJSON();
        this.$el.append(Mustache.render(songListItemTemplate, song));
        $('.song-list ul').append(this.el);
    },
    showSong: function(e) {
        //Get song from list and show song.
        Lyrical.currSongView = new Lyrical.Views.Song({model: this.model});
    },
    removeSongFromList: function() {
        this.$el.remove();
    }
})

//Add Song View
Lyrical.Views.AddSong = Backbone.View.extend({
    el: $('.song-container'),
    events: {
        'click .button-confirm-song': 'confirmAdd',
        'click .button-cancel-song': 'cancelSong',
        'click .button-show-nav': 'openNav'
    },
    initialize: function() {
        this.render();
    },
    confirmAdd: function() {
        console.log('adding song');
        var song = new Lyrical.Models.Song();
        song.set('title', $('.title', this.el).html());
        song.set('artist', $('.artist', this.el).html());
        song.set('tuning', $('.tuning', this.el).html());
        song.set('lyrics', $('.lyrics', this.el).html());
        this.collection.add(song);
        song.save();
        this.$el.empty();
        this.undelegateEvents();
    },
    cancelSong: function() {
        var empty = new Lyrical.Views.Empty();
    },
    render: function() {
        Lyrical.resetSongContainer();
        console.log('rending song add view');
        var addSongTemplate = $('#template-add-song').html();
        this.$el.append(Mustache.render(addSongTemplate));
    },
    openNav: function() {
        $('body').addClass('nav-open');
    },
    closeNav: function() {
        $('body').removeClass('nav-open');
    }
})

//Edit Song View
Lyrical.Views.EditSong = Backbone.View.extend({
    el: $('.song-container'),
    events: {
        'click .button-confirm-song': 'confirmEdit',
        'click .button-cancel-song': 'cancelSong',
        'click .button-show-nav': 'openNav',
    },
    initialize: function() {
        $('.title, .artist, .tuning', this.el).focus(function() {
            console.log('hello');
            $(this).select();
        })
        this.render();
    },
    confirmEdit: function() {
        console.log('editing song');
        this.model.set('title', $('.title', this.el).html());
        this.model.set('artist', $('.artist', this.el).html());
        this.model.set('tuning', $('.tuning', this.el).html());
        this.model.set('lyrics', $('.lyrics', this.el).html());
        this.model.save();
        var songView = new Lyrical.Views.Song({model: this.model})
    },
    cancelSong: function() {
        var songView = new Lyrical.Views.Song({model: this.model})
    },
    render: function() {
        Lyrical.resetSongContainer();
        console.log('rending song edit view');
        var addSongTemplate = $('#template-add-song').html();
        this.$el.append(Mustache.render(addSongTemplate));
        $('.title', this.el).html(this.model.get('title'));
        $('.artist', this.el).html(this.model.get('artist'));
        $('.tuning', this.el).html(this.model.get('tuning'));
        $('.lyrics', this.el).html(this.model.get('lyrics'));
    },
    openNav: function() {
        $('body').addClass('nav-open');
    },
    closeNav: function() {
        $('body').removeClass('nav-open');
    }
})