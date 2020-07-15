


SELECT Comment.Comment,
       Comment.Comment,
       Comment.PhotoId,
       Photo.Title as ParentName
FROM Comment
JOIN Photo ON Comment.PhotoId = Photo.PhotoId;




--SELECT pr.PhotoId AS PhotoId, pr.Title ,
--    (
--        SELECT pt.CommentId AS CommentId, pt.Comment AS Comment 
--        FROM Comment pt WHERE pt.PhotoId=pr.PhotoId 
--        FOR JSON PATH
--    ) AS [person.pet]
--FROM photo pr join UserInfo on 
--UserInfo.UserId = pr.UserId order by pr.PhotoId desc

select Photo.PhotoId,Photo.Title, Photo.Description,Photo.PhotoPath,Photo.CreationDate,UserInfo.UserId,
UserInfo.UserName,UserInfo.ProfilePath ,
(
        SELECT pt.CommentId AS CommentId, pt.Comment AS Comment 
        FROM Comment pt WHERE pt.PhotoId=Photo.PhotoId 
        FOR JSON PATH
    ) AS CommentList
from Photo 
join UserInfo on 
UserInfo.UserId = Photo.UserId order by Photo.PhotoId desc