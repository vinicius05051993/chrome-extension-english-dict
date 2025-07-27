create or replace function get_or_create_word_id(
word_input text,
translation_input text,
target_input text
)
returns bigint
language plpgsql
as $$
declare
word_id bigint;
begin
select id into word_id
from word
where word = word_input
and target = target_input;

    if word_id is null then
        insert into word (word, translation, target)
        values (word_input, translation_input, target_input)
        returning id into word_id;
    end if;

    return word_id;
end;
$$;