SELECT pr.PhotoId AS PhotoId, pr.Title ,
    (
        SELECT pt.CommentId AS CommentId, pt.Comment AS Comment 
        FROM Comment pt WHERE pt.PhotoId=pr.PhotoId 
        FOR JSON PATH
    ) AS [person.pet]
FROM photo pr join UserInfo on 
UserInfo.UserId = pr.UserId order by pr.PhotoId desc