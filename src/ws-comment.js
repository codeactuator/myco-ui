<script src="/webjars/sockjs-client/1.5.1/sockjs.min.js"></script>
<script src="/webjars/stomp-websocket/2.3.4/stomp.min.js"></script>

<script>
    const socket = new SockJS('/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);

        // Subscribe to a specific post
        stompClient.subscribe('/topic/posts/1/comments', function (comment) {
            const newComment = JSON.parse(comment.body);
            // Now update the UI with newComment
            console.log('New comment:', newComment);
        });
    });
</script>
