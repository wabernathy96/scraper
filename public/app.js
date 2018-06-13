$(document).ready(
  () =>{
    $('.modal').modal();
  }
);

$('#editNoteButton').click(
  () => {
    const id = $(this).attr('data-id');

    $.get(`/article/${id}`)
    .then (
      (data) => {
        if(data.note) {
          $('#noteTitleLabel').val(data.note.title);
          $('#noteBodyLabel').val(data.note.body);
        }
      }
    )
    .catch (
      (err) => {
        res.json(err);
      }
    )
  }
);

$('#saveNoteButton').click(
  () => {
    const id = $(this).attr('data-id');

    $.ajax(
      {
        method: 'POST',
        url: `/article/${id}`,
        data: {
          title: $('#noteTitle').val().trim(),
          body: $('#noteBody').val().trim()
        }
      }
    )
    .then (
      (data) => {
        console.log('FRESH NOTE DATA:', data);
      }
    )
    .catch (
      (err) => {
        res.json(err);
      }
    )

    $('#noteTitle').val('');
    $('#noteBody').val('');
  }
);

