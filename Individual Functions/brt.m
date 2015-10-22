function brt(inputfile)

outputfile = './brt_mid.csv';
mat=importdata(inputfile,'\n');
fout=fopen(outputfile,'w');
nrows=size(mat);
nrnew=0;
for row=1:nrows
    if (length(strfind(mat{row},'TAP'))==0)
       fprintf(fout,'%s\n',mat{row});
       nrnew=nrnew+1;
    end
end
fclose(fout);
'nrnew = ',nrnew;

fp=fopen(outputfile,'r');
fq=fopen('./Outputs/newbrt_1.csv','w');
nrow2= nrnew-1;
n5=nrow2/5;
%  "id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","details","Late Response","Response Window","Correct Button","Response Time","Inter Time Interval"
arr=[];
line=fgets(fp);
fprintf(fq,'%s\n', '"id","participant_id","timesent_utc","name","gender","handedness","time_gameplayed_utc","details","Late Response","Response Window","Correct Button","Response Time","Inter Time Interval"');

n=0;

while (~feof(fp))
  line=fgets(fp);
  s2=char(line);
  %fprintf(fq,'%s',s2);
  arr=strfind(s2,',');
  lst=length(s2)-1;
  if (length(strfind(s2,'Late'))>0)
     brr1=s2(arr(9)+1:lst);
     n=n+1;
  elseif (length(strfind(s2,'Window'))>0)
     brr2=s2(arr(9)+1:lst);
     n=n+1;
  elseif (length(strfind(s2,'Correct'))>0)
     brr3=s2(arr(9)+1:lst);
     n=n+1;
  elseif (length(strfind(s2,'Response Time'))>0)
     brr4=s2(arr(9)+1:lst);
     n=n+1;
  elseif (length(strfind(s2,'Inter'))>0)
      brr5=s2(arr(9)+1:lst);
     n=n+1;
  end
  if (n==5)
     fprintf(fq,'%s,%s,%s,%s,%s,%s\n',s2(1:arr(8)-1),brr1,brr2,brr3,brr4,brr5);
     n=0;
  end
end


delete('./brt_mid.csv');

end