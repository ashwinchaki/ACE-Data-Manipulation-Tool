function boxed(inputfile)

% nrows=size(mat);
nrnew=0;
'nrnew = ',nrnew;

fp=fopen(inputfile,'r');
fq=fopen('./Outputs/newboxed_1.csv','w');
nrow2= nrnew-1;
n5=nrow2/5;
%  "id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","details","Late Response","Response Window","Correct Button","Response Time","Inter Time Interval"
arr=[];
line=fgets(fp);
fprintf(fq,'%s\n', '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","details","Position Is Top","Late Response","Response Window","Correct Button","Response Time"');

n=0;

while (~feof(fp))
  line=fgets(fp);
  s2=char(line);
  %fprintf(fq,'%s',s2);
  arr=strfind(s2,',');
  lst=length(s2)-1;
  if (length(strfind(s2,'Position'))>0)
     brr1=s2(arr(9)+1:lst);
     n=n+1;
  elseif (length(strfind(s2,'Late'))>0)
     brr2=s2(arr(9)+1:lst);
     n=n+1;
  elseif (length(strfind(s2,'Window'))>0)
     brr3=s2(arr(9)+1:lst);
     n=n+1;
  elseif (length(strfind(s2,'Button'))>0)
     brr4=s2(arr(9)+1:lst);
     n=n+1;
  elseif (length(strfind(s2,'Time'))>0)
      brr5=s2(arr(9)+1:lst);
     n=n+1;
  end
  if (n==5)
     fprintf(fq,'%s,%s,%s,%s,%s,%s\n',s2(1:arr(8)-1),brr1,brr2,brr3,brr4,brr5);
     n=0;
  end
end
end